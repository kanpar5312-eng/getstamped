import { Eyebrow } from "@/components/ui/Eyebrow";
import { PlannerItemRow } from "@/components/timeline-planner/PlannerItemRow";
import { UpgradeInlineCard } from "@/components/timeline/UpgradeInlineCard";
import type { PlannerView } from "@/lib/timeline-planner";

type Props = {
  view: PlannerView;
  today: Date;
};

/**
 * View A — the default. 2-4 specific action items pulled from the full
 * plan, not the entire step list dumped at once.
 */
export function TodayCard({ view, today }: Props) {
  if (view.today.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 sm:p-7 text-center">
        <p className="font-display text-xl text-[var(--color-ink)]">
          All caught up.
        </p>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Nothing due right now — check the full timeline for what&rsquo;s ahead.
        </p>
      </section>
    );
  }

  // Free tier with nothing free left to do this week — one upgrade prompt
  // reads better than four near-identical locked rows.
  if (view.today.every((item) => item.isLocked)) {
    return <UpgradeInlineCard />;
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 sm:p-7">
      <Eyebrow>{view.isCompressed ? "Do these first" : "Due now"}</Eyebrow>
      <h2 className="mt-2 font-display text-2xl tracking-tight text-[var(--color-ink)]">
        {view.isCompressed
          ? "Time is tight — focus here."
          : "What to do today"}
      </h2>
      {view.isCompressed && (
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          There isn&rsquo;t enough runway left for an evenly-spaced plan, so
          this is only the highest-priority work — not the full list.
        </p>
      )}

      <ul className="mt-5 flex flex-col gap-3">
        {view.today.map((item) => (
          <PlannerItemRow key={item.step.number} item={item} today={today} />
        ))}
      </ul>
    </section>
  );
}
