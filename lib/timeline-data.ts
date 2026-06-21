/**
 * Pure functions that build the Timeline view model.
 *
 * Computes status (complete / in_progress / available / locked) for all 47
 * steps from a profile + progress array, then groups by phase with stats.
 */

import { PHASE_META, STEPS, TOTAL_STEPS, type Step } from "@/lib/steps";
import type {
  Plan,
  StepProgress,
  UserProfile,
} from "@/lib/dashboard-state";

export type StepStatus =
  | "complete"
  | "in_progress"
  | "available"
  | "locked";

export type StepView = {
  step: Step;
  status: StepStatus;
  /** Critical tip badge — surfaces a small "TIP" pill in the row. */
  hasCriticalTip: boolean;
  /** Set on complete + in_progress for the "{X ago}" line. */
  activityAt: Date | null;
};

export type PhaseView = {
  number: number;
  name: string;
  id: string;
  description: string;
  steps: StepView[];
  completed: number;
  total: number;
};

export type TimelineView = {
  phases: PhaseView[];
  totalComplete: number;
  totalSteps: number;
  percentComplete: number;
  plan: Plan;
  currency: "INR" | "USD";
};

// Hand-picked steps that get the "TIP" pill — high-stakes moments.
const CRITICAL_TIP_STEPS = new Set([8, 14, 19, 21, 22, 27, 32, 41, 46]);

const PHASE_DESCRIPTIONS: Record<number, string> = {
  1: "Where the journey begins. Choosing where to apply and securing your admission.",
  2: "The moment your I-20 lands, the visa clock starts. Eight foundation tasks before you touch the DS-160.",
  3: "The form that intimidates everyone. Twelve clear stages.",
  4: "The longest phase. The one where most applicants underprepare.",
  5: "The visa is stamped. Now the real preparation begins.",
};

export function buildTimelineView(
  profile: UserProfile,
  progress: StepProgress[],
  currency: "INR" | "USD" = "USD",
  now: Date = new Date(),
): TimelineView {
  const completeSet = new Set(
    progress.filter((p) => p.status === "complete").map((p) => p.stepNumber),
  );
  const inProgressSet = new Set(
    progress.filter((p) => p.status === "in_progress").map((p) => p.stepNumber),
  );

  // If nothing is explicitly in_progress but the user has progress, treat
  // the next step after the last completed one as in_progress for visual
  // continuity. This matches how the Dashboard's "Next step" already feels.
  const lastComplete = Math.max(0, ...Array.from(completeSet));
  if (lastComplete > 0 && lastComplete < TOTAL_STEPS && inProgressSet.size === 0) {
    inProgressSet.add(lastComplete + 1);
  }

  const totalComplete = completeSet.size;

  const stepViews: StepView[] = STEPS.map((rawStep) => {
    // Free tier sees Phase 1 only — every step in phases 2+ is locked.
    // We also strip the content fields off locked steps so a client
    // inspector never sees full paid content even if it scrapes props.
    const isPaywalled =
      profile.plan === "free" && rawStep.phase > 1;
    const step = isPaywalled
      ? {
          ...rawStep,
          shortDescription: "",
          instructions: { intro: "", steps: [] },
          documents: [],
        }
      : rawStep;

    let status: StepStatus;
    if (completeSet.has(step.number)) status = "complete";
    else if (inProgressSet.has(step.number)) status = "in_progress";
    else if (isPaywalled) status = "locked";
    else status = "available";

    // Synthesize activity timestamps so the UI feels alive in mock mode.
    let activityAt: Date | null = null;
    if (status === "complete") {
      // Earliest steps completed longest ago
      const daysAgo = Math.max(1, totalComplete - step.number + 1);
      activityAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    } else if (status === "in_progress") {
      activityAt = profile.lastActivityAt;
    }

    return {
      step,
      status,
      hasCriticalTip: CRITICAL_TIP_STEPS.has(step.number),
      activityAt,
    };
  });

  const phases: PhaseView[] = PHASE_META.map((p) => {
    const steps = stepViews.filter((sv) => sv.step.phase === p.number);
    const completed = steps.filter((sv) => sv.status === "complete").length;
    return {
      number: p.number,
      name: p.name,
      id: p.id,
      description: PHASE_DESCRIPTIONS[p.number] ?? "",
      steps,
      completed,
      total: steps.length,
    };
  });

  const percentComplete = Math.round((totalComplete / TOTAL_STEPS) * 100);

  return {
    phases,
    totalComplete,
    totalSteps: TOTAL_STEPS,
    percentComplete,
    plan: profile.plan,
    currency,
  };
}
