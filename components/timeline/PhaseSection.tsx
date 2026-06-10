"use client";

import { StepRow } from "@/components/timeline/StepRow";
import type { PhaseView, StepStatus } from "@/lib/timeline-data";

type FilterMode = "all" | "incomplete" | "completed" | "locked";

type Props = {
  phase: PhaseView;
  filter: FilterMode;
  index: number;
  onLockedClick: (stepNumber: number) => void;
};

function statusMatchesFilter(status: StepStatus, filter: FilterMode): boolean {
  if (filter === "all") return true;
  if (filter === "incomplete") return status === "available" || status === "in_progress";
  if (filter === "completed") return status === "complete";
  if (filter === "locked") return status === "locked";
  return true;
}

function emptyMessage(filter: FilterMode): string {
  switch (filter) {
    case "incomplete":
      return "All steps in this phase complete →";
    case "completed":
      return "No completed steps yet";
    case "locked":
      return "No locked steps here — Phase 1 is free.";
    default:
      return "";
  }
}

export function PhaseSection({
  phase,
  filter,
  index,
  onLockedClick,
}: Props) {
  const visibleSteps = phase.steps.filter((s) =>
    statusMatchesFilter(s.status, filter),
  );

  const pct = phase.total ? (phase.completed / phase.total) * 100 : 0;

  return (
    <section
      id={`phase-${phase.number}`}
      className="animate-fade-up"
      style={{
        animationDelay: `${index * 60}ms`,
        scrollMarginTop: "96px",
      }}
    >
      {/* Phase header card */}
      <div className="rounded-2xl bg-[var(--color-cream-soft)] p-6 sm:p-7 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-accent-deep)]">
              PHASE {String(phase.number).padStart(2, "0")}
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl tracking-tight text-[var(--color-ink)] leading-snug">
              {phase.name}
            </h2>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl text-[var(--color-forest)] tabular-nums leading-none">
              {phase.completed}/{phase.total}
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] font-medium text-[var(--color-muted)]">
              Steps complete
            </p>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-soft)]">
          {phase.description}
        </p>

        <div
          className="mt-4 h-1 w-full rounded-full bg-[var(--color-border-soft)] overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={phase.total}
          aria-valuenow={phase.completed}
          aria-label={`${phase.name} progress`}
        >
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps list */}
      {visibleSteps.length > 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] overflow-hidden divide-y divide-[var(--color-border-soft)]">
          {visibleSteps.map((view) => (
            <StepRow
              key={view.step.number}
              view={view}
              onLockedClick={onLockedClick}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-cream-soft)] p-5 text-center text-sm text-[var(--color-ink-soft)]">
          {emptyMessage(filter)}
        </div>
      )}
    </section>
  );
}
