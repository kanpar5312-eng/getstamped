/**
 * Per-user AI-check rate limits. Server-enforced — client counters can be
 * bypassed. Counts reset at UTC midnight (date-based, no cron needed).
 */

export type Tier = "free" | "paid";

export const LIMITS = {
  free: { perDoc: 3, global: 25 },
  paid: { perDoc: 10, global: 100 },
} as const;

export function tierFromPlan(plan: "free" | "solo" | "family" | string | null | undefined): Tier {
  return plan === "solo" || plan === "family" ? "paid" : "free";
}

/** Start of the current UTC day, as an ISO string for SQL `>=`. */
export function utcDayStart(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return d.toISOString();
}
