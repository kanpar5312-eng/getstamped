"use client";

import { useState } from "react";
import Link from "next/link";
import { PhaseNav } from "@/components/timeline/PhaseNav";
import { PhaseSection } from "@/components/timeline/PhaseSection";
import { FilterChips } from "@/components/timeline/FilterChips";
import { UpgradeModal } from "@/components/timeline/UpgradeModal";
import { UpgradeInlineCard } from "@/components/timeline/UpgradeInlineCard";
import type { TimelineView } from "@/lib/timeline-data";
import type { FilterMode } from "@/components/timeline/types";

type Props = {
  view: TimelineView;
};

function progressLabel(complete: number, total: number): React.ReactNode {
  if (complete === 0) return <span className="text-[var(--color-forest)]">Let&rsquo;s start</span>;
  if (complete >= total) return <span className="text-[var(--color-forest)]">All complete</span>;
  return <span className="text-[var(--color-forest)]">{complete} done</span>;
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--color-muted)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function TimelineClient({ view }: Props) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [lockedModal, setLockedModal] = useState<{ open: boolean; fromStep?: number }>({
    open: false,
  });

  const isFree = view.plan === "free";

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">
          Dashboard
        </Link>
        <ChevronRight />
        <span className="text-[var(--color-ink-soft)]">Timeline</span>
      </nav>

      {/* Header block */}
      <header className="mt-6 animate-fade-up">
        <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
          The full process
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
          Forty-seven steps. {progressLabel(view.totalComplete, view.totalSteps)}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--color-ink-soft)]">
          Every step is here. Open any one to see the instructions, documents
          needed, and common mistakes. Your progress saves automatically.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <FilterChips value={filter} onChange={setFilter} showLocked={isFree} />
          <span className="text-xs text-[var(--color-muted)] tabular-nums">
            {view.totalComplete}/{view.totalSteps} complete · {view.percentComplete}%
          </span>
        </div>

        {filter === "locked" && isFree && (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--color-forest)]/40 bg-[var(--color-forest)]/[0.04] p-4 text-sm text-[var(--color-ink-soft)] flex flex-wrap items-center justify-between gap-3">
            <span>
              These {view.phases.reduce((n, p) => n + p.steps.filter((s) => s.status === "locked").length, 0)} steps
              unlock with any paid plan.
            </span>
            <Link
              href="/dashboard/upgrade"
              className="text-[var(--color-forest)] font-medium hover:text-[var(--color-forest-deep)] transition-colors"
            >
              → Upgrade
            </Link>
          </div>
        )}

        <div className="mt-6 border-t border-[var(--color-border-soft)]" />
      </header>

      {/* Body — left rail (sticky on lg) + main column */}
      <div className="mt-8 flex flex-col lg:flex-row lg:gap-10">
        <PhaseNav phases={view.phases} />

        <div className="flex-1 min-w-0">
          {view.phases.map((phase, i) => (
            <div key={phase.id} className={i > 0 ? "mt-12" : ""}>
              <PhaseSection
                phase={phase}
                filter={filter}
                index={i}
                onLockedClick={(stepNumber) =>
                  setLockedModal({ open: true, fromStep: stepNumber })
                }
              />

              {/* Inline upgrade nudge after Phase 1 for free-tier users */}
              {isFree && phase.number === 1 && (
                <UpgradeInlineCard />
              )}
            </div>
          ))}
        </div>
      </div>

      <UpgradeModal
        open={lockedModal.open}
        fromStep={lockedModal.fromStep}
        onClose={() => setLockedModal({ open: false })}
      />
    </>
  );
}
