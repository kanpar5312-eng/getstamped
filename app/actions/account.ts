"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { sendMail } from "@/lib/email";

export type AccountResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  if (!isSupabaseConfigured()) return { ok: false as const, error: "Auth not configured." };
  const sb = await getServerSupabase();
  if (!sb) return { ok: false as const, error: "Supabase unavailable." };
  const { data } = await sb.auth.getUser();
  if (!data.user) return { ok: false as const, error: "Not signed in." };
  return { ok: true as const, sb, user: data.user };
}

/**
 * Triggers Supabase's email-change flow. The user receives an email at the new
 * address; on confirmation Supabase swaps the primary email.
 */
export async function requestEmailChange(newEmail: string): Promise<AccountResult> {
  if (!newEmail || !/.+@.+\..+/.test(newEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const { error } = await u.sb.auth.updateUser({ email: newEmail });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePassword(newPassword: string): Promise<AccountResult> {
  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const { error } = await u.sb.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function resetProgress(): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const userId = u.user.id;
  const [{ error: spErr }, { error: saErr }] = await Promise.all([
    u.sb.from("step_progress").delete().eq("user_id", userId),
    u.sb.from("step_activity").insert({ user_id: userId, action: "progress_reset" }),
  ]);
  if (spErr) return { ok: false, error: spErr.message };
  if (saErr) {/* non-fatal */}
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timeline");
  return { ok: true };
}

/**
 * Marks the account for deletion 30 days from now. A scheduled cron (cf. README)
 * picks rows where scheduled_deletion_at < now() and finalizes via admin API.
 * Signing in within the window clears the flag.
 */
export async function scheduleAccountDeletion(): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const when = new Date(Date.now() + 30 * 86_400_000).toISOString();
  const { error } = await u.sb
    .from("profiles")
    .update({ scheduled_deletion_at: when })
    .eq("id", u.user.id);
  if (error) return { ok: false, error: error.message };
  await u.sb.auth.signOut();
  return { ok: true };
}

/**
 * Refund request. Stripe isn't wired yet, so we route this through the
 * support inbox with a structured payload. When Stripe lands, this action
 * gets replaced with a real `stripe.refunds.create()` call.
 *
 * Eligibility window: 14 days from purchase. We don't enforce it server-side
 * yet — the support team checks against Stripe's record manually.
 */
export async function requestRefund(input: {
  reason: string;
}): Promise<AccountResult> {
  const reason = (input.reason ?? "").trim();
  if (reason.length < 10) {
    return { ok: false, error: "Tell us briefly why so we can process this faster." };
  }
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };

  const { data: profile } = await u.sb
    .from("profiles")
    .select("first_name, last_name, plan")
    .eq("id", u.user.id)
    .maybeSingle();

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || "Customer";
  const plan = profile?.plan ?? "unknown";
  const email = u.user.email ?? "(no email on file)";

  const subject = `[REFUND] ${name} · plan: ${plan}`;
  const text = `Refund request received via Settings → Plan.

User ID: ${u.user.id}
Name:    ${name}
Email:   ${email}
Plan:    ${plan}

Reason:
${reason}

— Action required: verify charge in Stripe, issue refund within 14-day window if eligible, reply to ${email}.`;

  const supportInbox = process.env.SUPPORT_INBOX ?? "hello@getstamped.app";
  await sendMail({
    to: supportInbox,
    subject,
    text,
    replyTo: email,
    from: "transactional",
  });

  return { ok: true };
}

export async function cancelAccountDeletion(): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const { error } = await u.sb
    .from("profiles")
    .update({ scheduled_deletion_at: null })
    .eq("id", u.user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Hard-delete an already-scheduled account. Requires service role key.
 * Called by the deletion cron OR directly from Settings if the user opts to
 * "delete immediately" with re-auth (not exposed in UI by default).
 */
export async function purgeAccountNow(): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return { ok: false, error: "Service role not configured." };
  const admin = createClient(getSupabaseUrl()!, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin.auth.admin.deleteUser(u.user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type NotifPrefs = {
  weekly_digest: boolean;
  reminders: boolean;
  product_updates: boolean;
  step_updates?: boolean;
};

export async function updateNotifPrefs(patch: Partial<NotifPrefs>): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  // Merge with existing
  const { data: row } = await u.sb
    .from("profiles")
    .select("notif_prefs")
    .eq("id", u.user.id)
    .maybeSingle();
  const current = (row?.notif_prefs as Partial<NotifPrefs> | null) ?? {};
  const next = { ...current, ...patch };
  const { error } = await u.sb
    .from("profiles")
    .update({ notif_prefs: next })
    .eq("id", u.user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Builds a JSON export of the user's data (profile + step_progress + documents
 * metadata + ai_threads + mock_interview_sessions). Returns a base64 payload
 * the UI can offer as a download. For large accounts this should move to a
 * background job + emailed link — for now we return inline.
 */
export async function exportUserData(): Promise<
  | { ok: true; filename: string; jsonBase64: string }
  | { ok: false; error: string }
> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const userId = u.user.id;
  const [profile, steps, activity, docs, threads, messages, sessions] = await Promise.all([
    u.sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
    u.sb.from("step_progress").select("*").eq("user_id", userId),
    u.sb.from("step_activity").select("*").eq("user_id", userId),
    u.sb.from("documents").select("*").eq("user_id", userId).is("deleted_at", null),
    u.sb.from("ai_threads").select("*").eq("user_id", userId),
    u.sb.from("ai_messages").select("*").eq("user_id", userId),
    u.sb.from("mock_interview_sessions").select("*").eq("user_id", userId),
  ]);
  const bundle = {
    exportedAt: new Date().toISOString(),
    user: { id: userId, email: u.user.email },
    profile: profile.data,
    step_progress: steps.data,
    step_activity: activity.data,
    documents: docs.data,
    ai_threads: threads.data,
    ai_messages: messages.data,
    mock_interview_sessions: sessions.data,
  };
  const json = JSON.stringify(bundle, null, 2);
  const buffer = Buffer.from(json, "utf-8");
  return {
    ok: true,
    filename: `getstamped-export-${new Date().toISOString().slice(0, 10)}.json`,
    jsonBase64: buffer.toString("base64"),
  };
}
