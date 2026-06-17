import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { computeDashboard } from "@/lib/dashboard-state";
import { getMock } from "@/lib/mock-user";
import { resolveToken as resolveMockToken } from "@/lib/parent-view";

/**
 * Server-side resolver for /parent/[token] public route.
 *
 * Uses the SERVICE-ROLE key (if available) so we can read another user's
 * profile/progress without RLS — anon would fail since RLS scopes to auth.uid.
 * Falls back to anon, then to the mock resolver if no Supabase is configured.
 *
 * Side effect: increments views + sets last_viewed_at on successful resolve.
 */

type Resolved =
  | { ok: true; profile: ReturnType<typeof computeDashboard>; isReal: boolean; firstName: string; studentUserId: string | null }
  | { ok: false };

export async function resolveParentToken(token: string): Promise<Resolved> {
  if (!isSupabaseConfigured()) {
    const res = resolveMockToken(token);
    if (!res.ok) return { ok: false };
    return {
      ok: true,
      profile: res.dashboard,
      isReal: false,
      firstName: res.user.profile.firstName,
      studentUserId: null,
    };
  }

  const url = getSupabaseUrl()!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceKey ?? getSupabaseAnonKey()!;
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const { data: tokenRow } = await sb
    .from("parent_view_tokens")
    .select("user_id, enabled, views")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || !tokenRow.enabled) return { ok: false };

  const [{ data: profileRow }, { data: progressRows }] = await Promise.all([
    sb.from("profiles").select("*").eq("id", tokenRow.user_id).maybeSingle(),
    sb.from("step_progress").select("step_number, status").eq("user_id", tokenRow.user_id),
  ]);

  if (!profileRow) return { ok: false };

  // Bump view counter (best-effort)
  void sb
    .from("parent_view_tokens")
    .update({
      views: (tokenRow.views ?? 0) + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq("token", token);

  const profile = {
    id: profileRow.id,
    firstName: profileRow.first_name ?? "Student",
    plan: (profileRow.plan ?? "free") as "free" | "solo" | "family",
    interviewDate: profileRow.interview_date ? new Date(profileRow.interview_date) : null,
    consulateLocation: profileRow.consulate ?? null,
    interviewTimeOfDay: null,
    visaStamped: Boolean(profileRow.visa_stamped),
    visaStampedAt: profileRow.visa_stamped_at ? new Date(profileRow.visa_stamped_at) : null,
    lastActivityAt: profileRow.last_active_at ? new Date(profileRow.last_active_at) : new Date(),
    mockInterviewsCompleted: 0,
    documentsOrganizedPct: 0,
  };

  type ProgressRow = { step_number: number; status: string };
  const progress = (progressRows ?? []).map((r: ProgressRow) => ({
    stepNumber: r.step_number,
    status: r.status as "not_started" | "in_progress" | "complete",
  }));

  const dashboard = computeDashboard(profile, progress);
  return {
    ok: true,
    profile: dashboard,
    isReal: true,
    firstName: profile.firstName,
    studentUserId: tokenRow.user_id as string,
  };
}

// Mock-friendly entry so the public route stays unchanged when env is empty.
export function isParentTokenReal(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) || isSupabaseConfigured();
}

// Use the mock variant as a noop helper
export { getMock };
