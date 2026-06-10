/**
 * Mock user profiles + progress for each dashboard state (A–F).
 *
 * Use `?state=A` through `?state=F` on the dashboard URL to render any state
 * without touching a database. Replaced by real Supabase queries later.
 */

import type {
  DashboardState,
  StepProgress,
  UserProfile,
} from "@/lib/dashboard-state";

const NOW = new Date("2026-06-06T12:00:00Z");

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);
}

function daysAhead(n: number): Date {
  return new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000);
}

function progressUpTo(n: number): StepProgress[] {
  return Array.from({ length: n }, (_, i) => ({
    stepNumber: i + 1,
    status: "complete" as const,
  }));
}

type Mock = { profile: UserProfile; progress: StepProgress[] };

const BASE_PROFILE: Omit<UserProfile, "id" | "firstName"> = {
  plan: "solo",
  interviewDate: daysAhead(13),
  consulateLocation: "Mumbai",
  interviewTimeOfDay: "morning",
  visaStamped: false,
  visaStampedAt: null,
  lastActivityAt: daysAgo(1),
  mockInterviewsCompleted: 2,
  documentsOrganizedPct: 78,
};

export const MOCKS: Record<DashboardState, Mock> = {
  // A — Just signed up. No progress yet. No interview booked.
  A: {
    profile: {
      ...BASE_PROFILE,
      id: "u-a",
      firstName: "Arya",
      interviewDate: null,
      consulateLocation: null,
      interviewTimeOfDay: null,
      lastActivityAt: daysAgo(0),
      mockInterviewsCompleted: 0,
      documentsOrganizedPct: 0,
    },
    progress: [],
  },

  // B — Standard mid-process: 23/47 done, interview booked 13 days out
  B: {
    profile: {
      ...BASE_PROFILE,
      id: "u-b",
      firstName: "Arya",
    },
    progress: progressUpTo(23),
  },

  // C — Stuck: 14/47 done, no activity in 9 days, no interview yet
  C: {
    profile: {
      ...BASE_PROFILE,
      id: "u-c",
      firstName: "Arya",
      interviewDate: null,
      consulateLocation: null,
      interviewTimeOfDay: null,
      lastActivityAt: daysAgo(9),
      mockInterviewsCompleted: 0,
      documentsOrganizedPct: 35,
    },
    progress: progressUpTo(14),
  },

  // D — Interview imminent (5 days), 38/47 done
  D: {
    profile: {
      ...BASE_PROFILE,
      id: "u-d",
      firstName: "Arya",
      interviewDate: daysAhead(5),
      lastActivityAt: daysAgo(0),
      mockInterviewsCompleted: 2,
      documentsOrganizedPct: 92,
    },
    progress: progressUpTo(38),
  },

  // E — Visa stamped (redirect happens at route level)
  E: {
    profile: {
      ...BASE_PROFILE,
      id: "u-e",
      firstName: "Arya",
      visaStamped: true,
      visaStampedAt: daysAgo(2),
      interviewDate: daysAgo(7),
      lastActivityAt: daysAgo(1),
    },
    progress: progressUpTo(44),
  },

  // F — Free tier, hit the paywall at step 7
  F: {
    profile: {
      ...BASE_PROFILE,
      id: "u-f",
      firstName: "Arya",
      plan: "free",
      interviewDate: null,
      consulateLocation: null,
      interviewTimeOfDay: null,
      lastActivityAt: daysAgo(1),
      mockInterviewsCompleted: 0,
      documentsOrganizedPct: 12,
    },
    progress: progressUpTo(6), // free tier max
  },
};

export function getMock(state: DashboardState | undefined): Mock {
  if (state && state in MOCKS) return MOCKS[state];
  return MOCKS.B; // default to standard mid-process
}

export function isValidState(s: string | undefined): s is DashboardState {
  return Boolean(s && ["A", "B", "C", "D", "E", "F"].includes(s));
}
