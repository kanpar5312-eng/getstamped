/**
 * Last time the 47-step playbook content was meaningfully updated.
 *
 * Bump this whenever you ship a change to:
 *   • lib/steps.ts (titles, mistakes, doc lists, estimated minutes)
 *   • lib/step-content.ts (rich content for steps 1–7)
 *   • lib/step-content-extended.ts (rich content for steps 8–47)
 *
 * Display in the Features bento and any other "we keep this current" surface.
 * Bumping it is a small honest signal to visitors that the playbook tracks
 * State Department changes.
 */
export const STEPS_LAST_UPDATED = new Date("2026-06-09T00:00:00Z");

/**
 * Domain we monitor for policy / fee / form changes. Single source of truth
 * for any "watching X" UI copy.
 */
export const STEPS_SOURCE_DOMAIN = "travel.state.gov";

export function stepsLastUpdatedLabel(): string {
  return STEPS_LAST_UPDATED.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * "3 days ago" / "yesterday" / "5 hours ago" — relative phrasing for cases
 * where exact date is less important than freshness.
 */
export function stepsLastUpdatedRelative(now: Date = new Date()): string {
  const diffMs = now.getTime() - STEPS_LAST_UPDATED.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffMin < 5)  return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr  < 24) return `${diffHr} hr${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 14) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.round(diffDay / 7)} wk ago`;
  return stepsLastUpdatedLabel();
}
