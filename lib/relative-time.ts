/**
 * Human-friendly relative time (English-only, deterministic).
 * "Just now" · "12 minutes ago" · "3 hours ago" · "2 days ago" · "Mar 14".
 */
export function timeAgo(when: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - when.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 14) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

  return when.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
