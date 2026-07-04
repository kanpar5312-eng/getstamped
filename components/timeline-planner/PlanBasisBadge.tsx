import type { PlanBasis } from "@/lib/timeline-planner";

/**
 * Small badge shown on both the Today and Full Timeline views so the user
 * always knows whether the plan is anchored to a real interview date or a
 * projected one.
 */
export function PlanBasisBadge({ basis }: { basis: PlanBasis }) {
  if (basis === "real") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent-tint)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent-deep)]">
        <span aria-hidden>✓</span>
        Your actual interview date
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-paper-deep)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-soft)]">
      <span aria-hidden>~</span>
      Estimated timeline
    </span>
  );
}
