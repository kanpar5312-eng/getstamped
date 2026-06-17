"use client";

/**
 * Section 6 — The full 47-step preview, phase-level accordion.
 *
 * Each phase header is a button — click to fold/unfold its steps.
 * Steps render flat inside (no per-step accordion, no scroll animation).
 * All phases collapsed by default.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PHASES } from "@/lib/constants";

const EASE = [0.22, 1, 0.36, 1] as const;

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

type PhaseProps = {
  phase: (typeof PHASES)[number];
  startIndex: number;
  isOpen: boolean;
  onToggle: () => void;
};

function PhaseSection({ phase, startIndex, isOpen, onToggle }: PhaseProps) {
  const buttonId = `phase-button-${phase.id}`;
  const panelId = `phase-panel-${phase.id}`;

  return (
    <div className="border-t border-[var(--color-paper-soft)]/15 first:border-t-0">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={[
          "group w-full text-left py-7 lg:py-8 px-4 -mx-4 rounded-xl",
          "transition-colors duration-200 ease-out",
          isOpen
            ? "bg-[var(--color-paper-soft)]/[0.04]"
            : "hover:bg-[var(--color-paper-soft)]/[0.03]",
          "focus-visible:outline-none focus-visible:bg-[var(--color-paper-soft)]/[0.06]",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <span aria-hidden className="block h-2 w-2 rounded-sm bg-[var(--color-accent)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-accent)]">
            {phase.label}
          </span>
          <span className="font-mono text-[10px] tracking-[0.15em] text-[var(--color-paper-soft)]/40 ml-auto">
            {String(phase.steps.length).padStart(2, "0")} STEPS
          </span>
          <motion.span
            animate={{ rotate: isOpen ? -180 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="text-[var(--color-paper-soft)]/45 group-hover:text-[var(--color-paper-soft)]/80 transition-colors"
          >
            <Chevron />
          </motion.span>
        </div>

        <h3 className="mt-3 font-display text-2xl sm:text-[28px] leading-snug tracking-tight text-[var(--color-paper-soft)]">
          {phase.name}
        </h3>
        <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-[var(--color-paper-soft)]/60">
          {phase.description}
        </p>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <ul className="pb-6 pt-1">
              {phase.steps.map((step, i) => {
                const idx = startIndex + i;
                const num = String(idx).padStart(2, "0");
                return (
                  <li
                    key={idx}
                    className="flex items-center gap-4 min-h-[52px] py-2.5 px-3 -mx-3 border-b border-[var(--color-paper-soft)]/10 last:border-b-0 hover:bg-[var(--color-paper-soft)]/[0.04] transition-colors"
                  >
                    <span className="font-mono text-[13px] text-[var(--color-accent)] w-10 shrink-0 tabular-nums">
                      {num}
                    </span>
                    <span className="text-[15px] text-[var(--color-paper-soft)] leading-snug">
                      {step.title}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TimelineFull() {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Precompute global step numbers per phase
  let cursor = 1;
  const phaseStart: Record<string, number> = {};
  for (const p of PHASES) {
    phaseStart[p.id] = cursor;
    cursor += p.steps.length;
  }

  return (
    <section
      id="timeline"
      className="w-full bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-accent)]">
            The full process
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-snug">
            Every step. Nothing hidden.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--color-paper-soft)]/70">
            Five phases. Forty-seven steps. Tap a phase to see what&rsquo;s
            inside.
          </p>
        </div>

        <div className="mx-auto mt-14 lg:mt-20 max-w-[820px] border-b border-[var(--color-paper-soft)]/15">
          {PHASES.map((phase) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              startIndex={phaseStart[phase.id]}
              isOpen={open.has(phase.id)}
              onToggle={() => toggle(phase.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
