/**
 * Visa Timeline Planner — turns the 47-step Playbook into a day-by-day
 * schedule anchored to either a real interview date or a projected one.
 *
 * This is a pure function of (profile, progress, now). There is no
 * separate "plan" persisted anywhere — every call recomputes the full
 * schedule from the same step_progress data the Playbook already uses, so
 * it can never go stale: a dashboard load IS the recalculation.
 */

import { STEPS, type Step } from "@/lib/steps";
import type { StepProgress, UserProfile } from "@/lib/dashboard-state";

export type PlanBasis = "real" | "estimated";

export type PlannedItem = {
  step: Step;
  dueDate: Date;
  /** Due date has already passed and the step isn't done. */
  isOverdue: boolean;
  /** Time-pressure flag — overdue, or the whole plan is compressed
   *  (too little runway for the steps left). Drives the "urgent" badge. */
  isUrgent: boolean;
  /** Hard external-processing step (SEVIS fee, DS-160, MRV fee, booking
   *  the interview) — always front-loaded regardless of date math. */
  isPriority: boolean;
  /** Phase 5 (post-approval) — scheduled AFTER the target date, never
   *  squeezed into the pre-interview runway. */
  isPostInterview: boolean;
  /** Free-tier + phase > 1 — same paywall boundary as the Playbook. */
  isLocked: boolean;
};

export type PlannerView = {
  basis: PlanBasis;
  targetDate: Date;
  /** Days from today to targetDate, floored at 0. */
  daysRemaining: number;
  /** True when there isn't enough runway left for the steps remaining —
   *  the "few days left, many steps" edge case (real dates), or a real
   *  interview date that's already passed with steps still open. */
  isBehindSchedule: boolean;
  /** Not enough days per remaining step to space things out evenly —
   *  the Today card should show only top-priority items, not a falsely
   *  calm even spread. */
  isCompressed: boolean;
  /** Human label for the basis badge. */
  paceLabel: string;
  /** 2-4 items for the "Today" view. */
  today: PlannedItem[];
  /** Every remaining step, sorted by due date, for the full timeline view. */
  plan: PlannedItem[];
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** "Schedule visa interview appointment" — once past this, a user should
 *  already be close to a real date, so the projection needs less lead time. */
const BOOK_INTERVIEW_STEP = 26;

/** Hard external-processing steps: fixed government processing/sequencing
 *  windows that don't bend to even spacing.
 *    8  — Pay the SEVIS I-901 fee (3 business days before it clears)
 *    21 — Review and submit DS-160 (must precede the MRV fee + booking)
 *    24 — Pay the MRV visa application fee
 *    26 — Schedule the visa interview appointment
 */
const HARD_EXTERNAL_STEPS = new Set([8, 21, 24, 26]);

const FLEXIBLE_TITLE = /mock interview|practice/i;

const POST_INTERVIEW_PHASE = 5;

/** Conservative default pace for users with too little history to trust —
 *  keeps the projected date realistic instead of unrealistically soon for
 *  someone who just signed up (edge case: near-zero progress). */
const DEFAULT_PACE_DAYS_PER_STEP = 2.5;
const MIN_PACE_DAYS_PER_STEP = 1;
const MAX_PACE_DAYS_PER_STEP = 6;

/** Consulates typically book appointment slots 4-6 weeks out once an
 *  applicant is actually ready to schedule; shrunk once the user is past
 *  the booking step (they'd realistically already be closer to a date). */
const LEAD_DAYS_NOT_YET_BOOKING = 35; // ~5 weeks, midpoint of 4-6
const LEAD_DAYS_PAST_BOOKING = 10;

const MIN_PROJECTED_DAYS = 14;
const MAX_PROJECTED_DAYS = 365;

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * MS_PER_DAY);
}
function diffDays(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_PER_DAY);
}

function isFlexibleStep(step: Step): boolean {
  return FLEXIBLE_TITLE.test(step.title) && !HARD_EXTERNAL_STEPS.has(step.number);
}

/**
 * Average days-per-step from the user's own completion history, when
 * there's enough of it to trust (3+ completed steps with timestamps).
 * Otherwise falls back to a conservative default. Because this reads
 * live step_progress data on every call, a user who speeds up or stalls
 * automatically shifts the projected date on the next render — no
 * separate "recalculate pace" step needed.
 */
function estimatePaceDaysPerStep(progress: StepProgress[]): number {
  const completedDates = progress
    .filter((p): p is StepProgress & { completedAt: Date } =>
      p.status === "complete" && p.completedAt instanceof Date,
    )
    .map((p) => p.completedAt)
    .sort((a, b) => a.getTime() - b.getTime());

  if (completedDates.length < 3) return DEFAULT_PACE_DAYS_PER_STEP;

  const span = diffDays(completedDates[completedDates.length - 1], completedDates[0]);
  const observed = span / (completedDates.length - 1);
  if (!Number.isFinite(observed) || observed <= 0) return DEFAULT_PACE_DAYS_PER_STEP;
  return Math.min(MAX_PACE_DAYS_PER_STEP, Math.max(MIN_PACE_DAYS_PER_STEP, observed));
}

function toItem(
  step: Step,
  dueDate: Date,
  today: Date,
  planIsCompressed: boolean,
  isFreePlan: boolean,
): PlannedItem {
  const isOverdue = dueDate.getTime() < today.getTime();
  return {
    step,
    dueDate,
    isOverdue,
    isUrgent: isOverdue || planIsCompressed,
    isPriority: HARD_EXTERNAL_STEPS.has(step.number),
    isPostInterview: step.phase === POST_INTERVIEW_PHASE,
    // Same paywall boundary as lib/timeline-data.ts: free tier = Phase 1 only.
    isLocked: isFreePlan && step.phase > 1,
  };
}

export function computePlannerView(
  profile: UserProfile,
  progress: StepProgress[],
  now: Date = new Date(),
): PlannerView {
  const today = startOfDay(now);
  const completeSet = new Set(
    progress.filter((p) => p.status === "complete").map((p) => p.stepNumber),
  );

  const remainingPre = STEPS.filter(
    (s) => s.phase < POST_INTERVIEW_PHASE && !completeSet.has(s.number),
  );
  const remainingPost = STEPS.filter(
    (s) => s.phase === POST_INTERVIEW_PHASE && !completeSet.has(s.number),
  );

  let basis: PlanBasis;
  let targetDate: Date;
  let paceLabel: string;

  if (profile.interviewDate) {
    // 1. Real date wins outright — no projection math involved. The
    //    instant a real date lands in the profile, this branch is what
    //    the very next render takes; nothing else needs to happen.
    basis = "real";
    targetDate = startOfDay(profile.interviewDate);
    paceLabel = "Based on your booked interview date.";
  } else {
    // 2. No real date yet — project one instead of blocking the planner.
    basis = "estimated";
    const pace = estimatePaceDaysPerStep(progress);
    const hasReachedBooking = Math.max(0, ...Array.from(completeSet)) >= BOOK_INTERVIEW_STEP;
    const leadDays = hasReachedBooking ? LEAD_DAYS_PAST_BOOKING : LEAD_DAYS_NOT_YET_BOOKING;
    const stepDays = Math.ceil(remainingPre.length * pace);
    const projectedOffset = Math.min(
      MAX_PROJECTED_DAYS,
      Math.max(MIN_PROJECTED_DAYS, stepDays + leadDays),
    );
    targetDate = addDays(today, projectedOffset);
    paceLabel = "Estimated target — update once you book your interview.";
  }

  const daysRemaining = Math.max(0, diffDays(targetDate, today));
  const isCompressed = remainingPre.length > 0 && daysRemaining < remainingPre.length * 0.5;
  const isBehindSchedule =
    remainingPre.length > 0 && (daysRemaining <= 0 || (basis === "real" && isCompressed));

  // --- distribute remainingPre across the [today, targetDate] window ---
  const windowDays = Math.max(1, daysRemaining);
  const hard = remainingPre.filter((s) => HARD_EXTERNAL_STEPS.has(s.number));
  const rest = remainingPre.filter((s) => !HARD_EXTERNAL_STEPS.has(s.number));

  const plan: PlannedItem[] = [];
  const isFreePlan = profile.plan === "free";

  // Hard-external steps: front-loaded (never spread thin), capped to the
  // first half of the window so they read as "do these first," not late.
  const hardCap = Math.max(1, Math.floor(windowDays * 0.5));
  hard.forEach((step, i) => {
    const offset = Math.min(hardCap, i * 2 + 1);
    plan.push(toItem(step, addDays(today, offset), today, isCompressed, isFreePlan));
  });

  // Everything else fills the rest of the window in natural (dependency)
  // order; flexible steps (mock interview practice) are nudged later
  // within their slot instead of competing for the same early dates.
  rest.forEach((step, i) => {
    const t = (i + 1) / (rest.length + 1);
    const bias = isFlexibleStep(step) ? Math.min(1, t + 0.12) : t;
    const offset = Math.max(1, Math.round(bias * windowDays));
    plan.push(toItem(step, addDays(today, offset), today, isCompressed, isFreePlan));
  });

  // Post-interview steps (Phase 5) happen after the visa is stamped —
  // scheduled forward from the target date, never squeezed before it.
  remainingPost.forEach((step, i) => {
    plan.push(toItem(step, addDays(targetDate, i * 2 + 1), today, false, isFreePlan));
  });

  plan.sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime() || a.step.number - b.step.number,
  );

  // --- "Today" card: 2-4 highest-priority items ---
  // Compressed plans skip the "due this week" framing entirely and just
  // show the top few priority items, flagged urgent — never a falsely
  // calm evenly-spaced plan when there isn't time for one.
  let todayItems: PlannedItem[];
  if (isCompressed) {
    todayItems = plan.slice(0, 3);
  } else {
    const dueThisWeek = plan.filter((item) => diffDays(item.dueDate, today) <= 7);
    todayItems = (dueThisWeek.length > 0 ? dueThisWeek : plan).slice(0, 4);
    if (todayItems.length < 2 && plan.length > todayItems.length) {
      todayItems = plan.slice(0, Math.min(2, plan.length));
    }
  }

  return {
    basis,
    targetDate,
    daysRemaining,
    isBehindSchedule,
    isCompressed,
    paceLabel,
    today: todayItems,
    plan,
  };
}
