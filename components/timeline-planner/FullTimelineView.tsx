import { Eyebrow } from "@/components/ui/Eyebrow";
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
      <Eyebrow>Full schedule</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)] leading-relaxed max-w-2xl">
        Every remaining step, grouped by the day it&rsquo;s scheduled for. Steps
        marked &ldquo;After interview&rdquo; happen once your visa is stamped, so
        they&rsquo;re listed after your target date rather than before it.
      </p>

      <ol className="mt-6 flex flex-col gap-6">
        {groups.map((group, i) => (
          <li key={group.key} className={i > 0 ? "pt-6 border-t border-[var(--color-border-soft)]" : ""}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">
                {group.label}
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                {group.items[0].dueDate.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                · {group.items.length} {group.items.length === 1 ? "step" : "steps"}
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
