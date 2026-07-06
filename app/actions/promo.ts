"use server";

import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

export type PromoResult =
  | { ok: true; plan: "solo" | "family"; trialDays: number | null; message: string }
  | { ok: false; error: string };

/**
 * Validates + redeems a promo code for the current user.
 * The redeem_promo_code SQL function does the atomic decrement so two
 * users can't both claim the last slot. On success we set the
 * profile.plan to the override and return the new plan.
 *
 * trial_days (e.g. BETA10 = 2) makes the grant temporary instead of
 * permanent — plan_trial_expires_at is set, and lib/current-user.ts
 * downgrades the profile back to 'free' the moment it passes, on every
 * read. This exists so a beta cohort can try everything without an
 * unlimited free tier eating AI/token cost indefinitely.
 */
export async function applyPromoCode(rawCode: string): Promise<PromoResult> {
  const code = (rawCode ?? "").trim();
  if (!code) return { ok: false, error: "Enter a code." };

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Please sign in before applying a code." };
  }
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Backend unavailable. Try again." };

  // redeem_promo_code now returns table(plan_override, trial_days), so
  // supabase-js resolves it as an array of 0 or 1 rows rather than a
  // scalar.
  const { data: rows, error } = await sb.rpc("redeem_promo_code", {
    p_code: code,
  });
  if (error) {
    console.error("[applyPromoCode] rpc error:", error);
    return { ok: false, error: "Couldn't validate the code. Try again." };
  }
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row?.plan_override) {
    return { ok: false, error: "Invalid or expired code." };
  }

  const newPlan = row.plan_override === "family" ? "family" : "solo";
  const trialDays: number | null = row.trial_days ?? null;
  const trialExpiresAt = trialDays
    ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error: profErr } = await sb
    .from("profiles")
    .update({ plan: newPlan, plan_trial_expires_at: trialExpiresAt })
    .eq("id", user.id);
  if (profErr) {
    // Profile failed to update — best-effort: tell the user, but the
    // code has already been redeemed atomically. Manual intervention.
    console.error("[applyPromoCode] profile update failed:", profErr);
    return { ok: false, error: "Code accepted but plan update failed. Contact support." };
  }

  return {
    ok: true,
    plan: newPlan,
    trialDays,
    message: trialDays
      ? `Code applied — you have full ${newPlan === "family" ? "Family" : "Solo"} access for ${trialDays} day${trialDays === 1 ? "" : "s"}. Try everything before it reverts to Basic.`
      : "Code applied — Full access unlocked",
  };
}
