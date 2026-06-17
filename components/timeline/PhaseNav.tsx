"use client";

import { useEffect, useState } from "react";
import type { PhaseView } from "@/lib/timeline-data";

type Props = {
  phases: PhaseView[];
};

function ProgressDot({ completed, total }: { completed: number; total: number }) {
  const pct = total ? completed / total : 0;
  if (pct >= 1) {
    return (
      <span
        aria-hidden
        className="block h-2.5 w-2.5 rounded-full bg-[var(--color-persimmon)]"
      />
    );
  }
  if (pct > 0) {
    return (
      <span
        aria-hidden
        className="relative block h-2.5 w-2.5 rounded-full border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]"
      >
        <span
          className="absolute left-0 top-0 h-full bg-[var(--color-persimmon)]"
          style={{ width: `${pct * 100}%` }}
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="block h-2.5 w-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]"
    />
  );
}

export function PhaseNav({ phases }: Props) {
  const [active, setActive] = useState<string>(`phase-${phases[0]?.number ?? 1}`);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = phases.map((p) => `phase-${p.number}`);
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      {
        threshold: [0.3],
        rootMargin: "-96px 0px -50% 0px",
      },
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [phases]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Desktop: sticky left rail */}
      <aside
        aria-label="Phase navigation"
        className="hidden lg:block sticky top-24 self-start w-[220px] flex-shrink-0"
      >
        <ul className="divide-y divide-[var(--color-border-soft)] rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] overflow-hidden">
          {phases.map((p) => {
            const id = `phase-${p.number}`;
            const isActive = active === id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(id)}
                  aria-label={`Jump to ${p.name}, ${p.completed} of ${p.total} complete`}
                  className={[
                    "w-full text-left transition-colors py-3 px-3 flex flex-col gap-1",
                    isActive
                      ? "bg-[var(--color-paper)] border-l-2 border-[var(--color-ink)] pl-[10px]"
                      : "hover:bg-[var(--color-paper)]/60",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[var(--color-muted)]">
                      Phase {String(p.number).padStart(2, "0")}
                    </span>
                    <ProgressDot completed={p.completed} total={p.total} />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-ink)] leading-snug">
                    {p.name}
                  </span>
                  <span className="text-[11px] text-[var(--color-muted)] tabular-nums">
                    {p.completed}/{p.total} complete
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Mobile: horizontal scroll chip strip */}
      <nav
        aria-label="Phase navigation (mobile)"
        className="lg:hidden -mx-5 sm:-mx-6 px-5 sm:px-6 mb-6 overflow-x-auto"
      >
        <ul className="flex items-center gap-2 snap-x snap-mandatory">
          {phases.map((p) => {
            const id = `phase-${p.number}`;
            const isActive = active === id;
            return (
              <li key={p.id} className="snap-start">
                <button
                  type="button"
                  onClick={() => scrollTo(id)}
                  className={[
                    "whitespace-nowrap rounded-full px-4 py-2 text-xs transition-colors",
                    isActive
                      ? "bg-[var(--color-persimmon)] text-[var(--color-paper-soft)]"
                      : "bg-[var(--color-paper-soft)] border border-[var(--color-border-soft)] text-[var(--color-ink-soft)]",
                  ].join(" ")}
                >
                  {p.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
