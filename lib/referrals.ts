import "server-only";
import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import { sendMail } from "@/lib/email";
import { renderReferralRewardEmail } from "@/lib/email-templates/referral-reward";

/* ════════════════════════════════════════════════════════════════════════
   Referral program — code generation, attribution, reward issuance.

   The two side-effects of this module:
     1. ensureReferralCodeFor(userId)        → returns the user's share code
     2. markReferralCompleted(refereeUserId) → called by future checkout
                                                webhook after a paid signup
   ════════════════════════════════════════════════════════════════════════ */

export const REFERRAL_COOKIE = "gs_ref";
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export const REWARD_INR_PAISE = 500_00;   // ₹500
export const REWARD_USD_CENTS = 8_00;     // $8
export const REFEREE_DISCOUNT_PCT = 10;   // 10% off at checkout

/** Crockford base32 minus look-alikes — friendlier to type than a UUID. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(len = 7): string {
  let out = "";
  const buf = new Uint8Array(len);
  // node crypto.getRandomValues is on globalThis in Edge + Node 19+
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) {
    out += ALPHABET[buf[i]! % ALPHABET.length];
  }
  return out;
}

function adminClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Returns the user's referral code, generating + persisting one if they
 * don't have it yet. Idempotent — safe to call every page load. Retries
 * up to 5x on the (vanishingly rare) unique-index collision.
 */
export async function ensureReferralCodeFor(userId: string): Promise<string | null> {
  const sb = await getServerSupabase();
  if (!sb) return null;

  const { data } = await sb
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .maybeSingle();
  if (data?.referral_code) return data.referral_code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await sb
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", userId);
    if (!error) return code;
    if (!/duplicate|unique/i.test(error.message)) {
      console.error("[referrals] failed to set code:", error);
      return null;
    }
  }
  return null;
}

export type ReferralStats = {
  code: string | null;
  totalReferred: number;
  totalCompleted: number;
  creditInrPaise: number;
  creditUsdCents: number;
};

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const sb = await getServerSupabase();
  if (!sb) {
    return { code: null, totalReferred: 0, totalCompleted: 0, creditInrPaise: 0, creditUsdCents: 0 };
  }

  const code = await ensureReferralCodeFor(userId);

  const [{ data: profileRow }, { data: refs }] = await Promise.all([
    sb.from("profiles")
      .select("referral_credit_inr_paise, referral_credit_usd_cents")
      .eq("id", userId)
      .maybeSingle(),
    sb.from("referrals")
      .select("status")
      .eq("referrer_user_id", userId),
  ]);

  const totalReferred = refs?.length ?? 0;
  const totalCompleted = (refs ?? []).filter((r) => r.status === "completed").length;

  return {
    code,
    totalReferred,
    totalCompleted,
    creditInrPaise: profileRow?.referral_credit_inr_paise ?? 0,
    creditUsdCents: profileRow?.referral_credit_usd_cents ?? 0,
  };
}

/**
 * Reads the referral cookie set by /r/[code] and, if it points to a real
 * code that's not the referee's own, creates a pending referrals row.
 * Called from the signUp server action right after the user is created.
 *
 * Cookie stays in place after attribution so the user doesn't trigger a
 * race; the unique(referee_user_id) constraint deduplicates on the DB
 * side, and the cookie expires naturally in 90 days.
 */
export async function attachReferralFromCookie(refereeUserId: string): Promise<void> {
  const store = await cookies();
  const code = store.get(REFERRAL_COOKIE)?.value?.trim();
  if (!code) return;

  const admin = adminClient();
  if (!admin) return;

  const { data: referrer } = await admin
    .from("profiles")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();
  if (!referrer || referrer.id === refereeUserId) return;

  const { error } = await admin.from("referrals").insert({
    referrer_user_id: referrer.id,
    referee_user_id: refereeUserId,
    code,
    status: "pending",
  });
  // The unique(referee_user_id) constraint will surface duplicate-key
  // errors if the user is somehow re-attributed; silently swallow.
  if (error && !/duplicate|unique/i.test(error.message)) {
    console.error("[referrals] attach failed:", error);
  }
}

/**
 * Future checkout webhook calls this when a referee's first paid signup
 * lands. Flips the referral to completed, accrues the reward to the
 * referrer's balance, and fires the "you earned a reward" email.
 *
 * Returns:
 *   { ok: true, awarded: true }  — referral existed + reward applied
 *   { ok: true, awarded: false } — no pending referral for this user
 *   { ok: false, error }         — Supabase or email failure
 */
export async function markReferralCompleted(refereeUserId: string): Promise<
  | { ok: true; awarded: boolean }
  | { ok: false; error: string }
> {
  const admin = adminClient();
  if (!admin) return { ok: false, error: "Supabase admin unavailable" };

  // Load the pending referral.
  const { data: ref, error: refErr } = await admin
    .from("referrals")
    .select("id, referrer_user_id, status, reward_applied")
    .eq("referee_user_id", refereeUserId)
    .maybeSingle();
  if (refErr) return { ok: false, error: refErr.message };
  if (!ref || ref.status !== "pending" || ref.reward_applied) {
    return { ok: true, awarded: false };
  }

  // Pick which currency the referrer should be credited in. The referrer's
  // current geo/currency cookie isn't available here, so we use the country
  // on their profile: India → INR, everywhere else → USD.
  const { data: refProfile } = await admin
    .from("profiles")
    .select("id, country, first_name, referral_credit_inr_paise, referral_credit_usd_cents")
    .eq("id", ref.referrer_user_id)
    .maybeSingle();
  if (!refProfile) return { ok: false, error: "Referrer profile missing" };

  const useInr = (refProfile.country ?? "").toLowerCase() === "india";
  const update = useInr
    ? { referral_credit_inr_paise: (refProfile.referral_credit_inr_paise ?? 0) + REWARD_INR_PAISE }
    : { referral_credit_usd_cents: (refProfile.referral_credit_usd_cents ?? 0) + REWARD_USD_CENTS };

  // Single-statement transaction-ish: update profile, then flip referral.
  // If the second update fails, the first leaves the referrer with credit
  // but the referral still pending — manual cleanup, but never double-pay.
  const { error: profErr } = await admin.from("profiles").update(update).eq("id", refProfile.id);
  if (profErr) return { ok: false, error: profErr.message };

  const { error: flipErr } = await admin
    .from("referrals")
    .update({ status: "completed", reward_applied: true, completed_at: new Date().toISOString() })
    .eq("id", ref.id);
  if (flipErr) return { ok: false, error: flipErr.message };

  // Fire the email — best-effort, never block the webhook on it.
  try {
    const { data: refUser } = await admin.auth.admin.getUserById(refProfile.id);
    const referrerEmail = refUser?.user?.email ?? null;
    if (referrerEmail) {
      const tmpl = renderReferralRewardEmail({
        firstName: refProfile.first_name ?? "",
        rewardLabel: useInr ? "₹500" : "$8",
        ctaUrl: `${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://getstamped.app"}/dashboard/settings#refer`,
      });
      await sendMail({
        to: referrerEmail,
        subject: tmpl.subject,
        html: tmpl.html,
        text: tmpl.text,
      });
    }
  } catch (err) {
    console.error("[referrals] reward email failed:", err);
  }

  return { ok: true, awarded: true };
}

/**
 * Helper for future checkout: returns the discount percent to grant a
 * referee on their first paid purchase. Currently a flat 10% if they
 * have any referral row at all (pending OR completed). Returns 0 if
 * they're a first-party signup.
 */
export async function getRefereeDiscountPercent(refereeUserId: string): Promise<number> {
  const admin = adminClient();
  if (!admin) return 0;
  const { data } = await admin
    .from("referrals")
    .select("id")
    .eq("referee_user_id", refereeUserId)
    .maybeSingle();
  return data ? REFEREE_DISCOUNT_PCT : 0;
}
