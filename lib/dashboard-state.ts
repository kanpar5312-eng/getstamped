/**
 * Dashboard state computation.
 *
 * Reads a mock user profile + progress and resolves which UI state to render
 * (A through F). Once Supabase is wired, swap the mock-user import for a
 * real Supabase RPC; the shape stays identical.
 */

import { STEPS, TOTAL_STEPS, type Step } from "@/lib/steps";

export type DashboardState = "A" | "B" | "C" | "D" | "E" | "F";

export type Plan = "free" | "solo" | "family";

export type UserProfile = {
  id: string;
  firstName: string;
  plan: Plan;
  interviewDate: Date | null;
  consulateLocation: string | null;
  interviewTimeOfDay: "morning" | "afternoon" | null;
  visaStamped: boolean;
  visaStampedAt: Date | null;
  lastActivityAt: Date;
  mockInterviewsCompleted: number;
  documentsOrganizedPct: number;
};

export type StepProgress = {
  stepNumber: number;
  status: "not_started" | "in_progress" | "complete";
};

export type DashboardData = {
  state: DashboardState;
  profile: UserProfile;
  stepsComplete: number;
  percentComplete: number;
  nextStep: Step | null;
  currentPhase: number | null;
  currentPhaseName: string | null;
  daysToInterview: number | null;
  daysSinceActivity: number;
  isStuck: boolean;
  isInterviewImminent: boolean;
  paywallReached: boolean;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function diffInDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / MS_PER_DAY);
}

export function computeDashboard(
  profile: UserProfile,
  progress: StepProgress[],
  now: Date = new Date(),
): DashboardData {
  const completeSet = new Set(
    progress.filter((p) => p.status === "complete").map((p) => p.stepNumber),
  );
  const stepsComplete = completeSet.size;
  const percentComplete = Math.round((stepsComplete / TOTAL_STEPS) * 100);

  // Next step = lowest-numbered step not yet complete
  const nextStep = STEPS.find((s) => !completeSet.has(s.number)) ?? null;
  const currentPhase = nextStep?.phase ?? null;
  const currentPhaseName = nextStep?.phaseName ?? null;

  const daysToInterview = profile.interviewDate
    ? diffInDays(profile.interviewDate, now)
    : null;
  const isInterviewImminent =
    daysToInterview !== null && daysToInterview <= 7 && daysToInterview >= 0;

  const daysSinceActivity = diffInDays(now, profile.lastActivityAt);
  const isStuck = daysSinceActivity >= 7 && stepsComplete > 0;

  // Paywall reached if next step is past the free tier and plan is free
  const paywallReached = Boolean(
    profile.plan === "free" && nextStep && !nextStep.isFree,
  );

  let state: DashboardState;
  if (profile.visaStamped) state = "E";
  else if (stepsComplete === 0) state = "A";
  else if (isInterviewImminent) state = "D";
  else if (paywallReached) state = "F";
  else if (isStuck) state = "C";
  else state = "B";

  return {
    state,
    profile,
    stepsComplete,
    percentComplete,
    nextStep,
    currentPhase,
    currentPhaseName,
    daysToInterview,
    daysSinceActivity,
    isStuck,
    isInterviewImminent,
    paywallReached,
  };
}
