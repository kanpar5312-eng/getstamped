import "server-only";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getMock, isValidState } from "@/lib/mock-user";
import { homeCodeFromCountryName } from "@/lib/home-countries";
import type {
  Plan,
  StepProgress,
  UserProfile,
} from "@/lib/dashboard-state";

/**
 * Single source for "who's the current user, and what's their progress?"
 *
 * Behavior:
 *   - Real session exists → query Supabase profiles + step_progress.
 *   - No Supabase or no session, with ?state=A..F → use the matching mock.
 *   - Otherwise → default mock (state B).
 *
 * Every dashboard page calls this instead of getMock() directly so the
 * flip from mock to real is one config away.
 */
export async function getCurrentUser(stateParam?: string): Promise<{
  profile: UserProfile;
  progress: StepProgress[];
  isReal: boolean;
}> {
  if (isSupabaseConfigured()) {
    const sb = await getServerSupabase();
    if (sb) {
      // Cached — shared with layout's getSessionUser() call, so this is free.
      const user = await getSessionUser();
      if (user) {
        const [{ data: profileRow }, { data: progressRows }] = await Promise.all([
          sb.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          sb.from("step_progress").select("step_number, status, completed_at").eq("user_id", user.id),
        ]);

        // Promo-code trials (e.g. BETA10) grant a plan for a fixed number
        // of days, not forever — plan_trial_expires_at is set at redemption
        // (see app/actions/promo.ts). Enforce it here, on every read, so
        // access reverts to Basic the moment the trial passes rather than
        // waiting for a cron tick. Persisted, not just computed in-memory,
        // so every other read path (mock-interview quota, document checks,
        // the upgrade page) sees the downgrade immediately too.
        let plan = (profileRow?.plan as Plan) ?? "free";
        const trialExpiresAt = profileRow?.plan_trial_expires_at
          ? new Date(profileRow.plan_trial_expires_at)
          : null;
        if (plan !== "free" && trialExpiresAt && trialExpiresAt.getTime() <= Date.now()) {
          plan = "free";
          await sb
            .from("profiles")
            .update({ plan: "free", plan_trial_expires_at: null })
            .eq("id", user.id);
        }

        const profile: UserProfile = {
          id: user.id,
          firstName: profileRow?.first_name ?? user.email?.split("@")[0] ?? "Student",
          plan,
          interviewDate: profileRow?.interview_date ? new Date(profileRow.interview_date) : null,
          consulateLocation: profileRow?.consulate ?? null,
          interviewTimeOfDay: null,
          visaStamped: Boolean(profileRow?.visa_stamped),
          visaStampedAt: profileRow?.visa_stamped_at ? new Date(profileRow.visa_stamped_at) : null,
          lastActivityAt: profileRow?.last_active_at
            ? new Date(profileRow.last_active_at)
            : new Date(),
          mockInterviewsCompleted: 0,
          documentsOrganizedPct: 0,
          homeCountry: homeCodeFromCountryName(profileRow?.country),
        };

        type ProgressRow = { step_number: number; status: string; completed_at: string | null };
        const progress: StepProgress[] = (progressRows ?? []).map((r: ProgressRow) => ({
          stepNumber: r.step_number,
          status: r.status as StepProgress["status"],
          completedAt: r.completed_at ? new Date(r.completed_at) : null,
        }));

        return { profile, progress, isReal: true };
      }
    }
  }

  // Fallback: mock mode (dev or unauthenticated public path)
  const state = isValidState(stateParam) ? stateParam : undefined;
  const m = getMock(state);
  return { profile: m.profile, progress: m.progress, isReal: false };
}
