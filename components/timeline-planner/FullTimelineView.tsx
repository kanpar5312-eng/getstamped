import { PlannerItemRow, formatDue } from "@/components/timeline-planner/PlannerItemRow";
import type { PlannerView } from "@/lib/timeline-planner";

type Props = {
  view: PlannerView;
  today: Date;
};

type DateGroup = { key: string; label: string; items: PlannerView["plan"] };

function groupByDate(view: PlannerView, today: Date): DateGroup[] {
  const groups = new Map<string, DateGroup>();
  for (const item of view.plan) {
    const key = item.dueDate.toDateString();
    if (!groups.has(key)) {
      groups.set(key, { key, label: formatDue(item.dueDate, today), items: [] });
    }
    groups.get(key)!.items.push(item);
  }
  return Array.from(groups.values());
}

/**
 * View B — the full backward-planned schedule, grouped by date. Includes
 * post-interview (Phase 5) items, visually separated since they fall after
 * the target date rather than counting against the remaining runway.
 */
export function FullTimelineView({ view, today }: Props) {
  const groups = groupByDate(view, today);

  if (groups.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 sm:p-7 text-center">
        <p className="font-display text-xl text-[var(--color-ink)]">
          Every step is complete.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 sm:p-7">
      <ol className="flex flex-col gap-6">
        {groups.map((group) => (
          <li key={group.key}>
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                {group.label}
              </span>
              <span className="text-[11px] text-[var(--color-muted)]">
                {group.items[0].dueDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {group.items.map((item) => (
                <PlannerItemRow key={item.step.number} item={item} today={today} compact />
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
