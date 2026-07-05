import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";

/* ════════════════════════════════════════════════════════════════════════
   checkLimit — single source of truth for usage metering.

   Never trust client-side state; every metered API route calls this
   server-side, returns the response unchanged on `allowed: true`, and
   logs to usage_logs *after* the underlying action succeeds (so a Groq
   timeout or a Storage failure doesn't burn a quota slot).

   Reset semantics:
   • ai_question     daily,  reset = next UTC midnight
   • mock_interview  weekly, reset = next Monday UTC midnight — capped
     per plan (see MOCK_INTERVIEW_WEEKLY_LIMIT), not just free tier
   • document_review hard-blocked for free, unlimited on any paid plan

   Note on Family's "6 each": the product only tracks one profile per
   paid account today — there's no seats/sub-accounts data model, so a
   per-student split can't be enforced server-side yet. The 12/week cap
   below is the combined total for the account; splitting it 6-and-6
   requires an actual multi-seat feature.
   ════════════════════════════════════════════════════════════════════════ */

export type LimitedAction =
  | "ai_question"
  | "mock_interview"
  | "document_review";

export type LimitCheck = {
  allowed: boolean;
  used: number;
  limit: number;
  reset_at: string;
};

const FREE_LIMITS = {
  ai_question: 3,
  mock_interview: 1,
  document_review: 0,
} as const;

/** Weekly mock-interview cap by plan — Solo and Family are metered too,
 *  not unlimited (ai_question / document_review stay unlimited on paid). */
const MOCK_INTERVIEW_WEEKLY_LIMIT: Record<"free" | "solo" | "family", number> = {
  free: FREE_LIMITS.mock_interview,
  solo: 5,
  family: 12,
};

/** Midnight UTC of today, ISO. */
function todayUtcStart(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Midnight UTC of tomorrow, ISO. */
function tomorrowUtcStart(): Date {
  const t = todayUtcStart();
  return new Date(t.getTime() + 86_400_000);
}

/** Most recent Monday 00:00 UTC (Monday counts as itself). */
function lastMondayUtcStart(): Date {
  const t = todayUtcStart();
  // getUTCDay: 0=Sun, 1=Mon, … 6=Sat. Days since Mon = (day + 6) % 7.
  const offset = (t.getUTCDay() + 6) % 7;
  return new Date(t.getTime() - offset * 86_400_000);
}

/** Next Monday 00:00 UTC, strictly after now. */
function nextMondayUtcStart(): Date {
  return new Date(lastMondayUtcStart().getTime() + 7 * 86_400_000);
}

/** End-of-time sentinel used as reset_at for hard-blocked actions. */
const NEVER = new Date("9999-12-31T00:00:00Z").toISOString();

export async function checkLimit(
  userId: string,
  action: LimitedAction,
): Promise<LimitCheck> {
  const sb = await getServerSupabase();
  if (!sb) {
    // No Supabase configured → don't block locally; treat as allowed.
    return { allowed: true, used: 0, limit: 0, reset_at: NEVER };
  }

  const { data: prof } = await sb
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  const plan = (prof?.plan as "free" | "solo" | "family" | undefined) ?? "free";
  const isPaid = plan !== "free";

  // Document review is a binary unlock — free tier never gets it, any
  // paid plan is unlimited. No usage_logs read needed either way.
  if (action === "document_review") {
    return isPaid
      ? { allowed: true, used: 0, limit: Infinity, reset_at: NEVER }
      : { allowed: false, used: 0, limit: 0, reset_at: NEVER };
  }

  // AI Q&A stays unlimited on any paid plan — only mock_interview is
  // metered per plan below.
  if (action === "ai_question" && isPaid) {
    return { allowed: true, used: 0, limit: Infinity, reset_at: NEVER };
  }

  const limit =
    action === "mock_interview" ? MOCK_INTERVIEW_WEEKLY_LIMIT[plan] : FREE_LIMITS[action];

  const windowStart =
    action === "mock_interview" ? lastMondayUtcStart() : todayUtcStart();
  const resetAt =
    action === "mock_interview" ? nextMondayUtcStart() : tomorrowUtcStart();

  const { count, error } = await sb
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action_type", action)
    .gte("created_at", windowStart.toISOString());

  if (error) {
    console.error("[checkLimit] count failed:", error);
    // Fail open so a transient DB error doesn't lock paying behavior;
    // the worst case is one extra free action.
    return { allowed: true, used: 0, limit, reset_at: resetAt.toISOString() };
  }

  const used = count ?? 0;
  return {
    allowed: used < limit,
    used,
    limit,
    reset_at: resetAt.toISOString(),
  };
}

/**
 * Call AFTER the metered action succeeds. Writes one row to usage_logs.
 * Best-effort — a failed insert doesn't roll back the action.
 */
export async function logUsage(
  userId: string,
  action: LimitedAction,
): Promise<void> {
  const sb = await getServerSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("usage_logs")
    .insert({ user_id: userId, action_type: action });
  if (error) {
    console.error("[logUsage] insert failed:", error);
  }
}
