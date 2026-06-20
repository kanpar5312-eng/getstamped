/**
 * Human-friendly relative time (English-only, deterministic).
 * "Just now" · "12 minutes ago" · "3 hours ago" · "2 days ago" · "Mar 14".
 */
export function timeAgo(when: Date | string | number, now: Date = new Date()): string {
  // Accept anything date-ish — RSC payloads sometimes hand us ISO strings
  // instead of Date objects (and server actions always do), so coerce.
  const d = when instanceof Date ? when : new Date(when);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 14) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
