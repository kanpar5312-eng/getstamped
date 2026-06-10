"use client";

import { SlidePanel } from "@/components/ui/SlidePanel";
import type { Step } from "@/lib/steps";

type Props = {
  open: boolean;
  onClose: () => void;
  step: Step;
};

export function WhyThisMattersPanel({ open, onClose, step }: Props) {
  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      eyebrow={`Step ${String(step.number).padStart(2, "0")} · Phase ${step.phase}`}
      title={step.title}
    >
      <div className="space-y-7">
        <section>
          <h3 className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            What this step is
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]">
            {step.shortDescription}
          </p>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Instructions
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            {step.instructions}
          </p>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Documents needed
          </h3>
          <p className="mt-3 font-display text-3xl tracking-tight text-[var(--color-forest)] tabular-nums leading-none">
            {step.documentsNeeded}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Full list opens when you start the step.
          </p>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Common mistakes
          </h3>
          <ul className="mt-3 space-y-2">
            {step.commonMistakes.map((m, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--color-ink)]"
              >
                <span
                  aria-hidden
                  className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shrink-0"
                />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Tips
          </h3>
          <ul className="mt-3 space-y-2">
            {step.tips.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--color-ink)]"
              >
                <span
                  aria-hidden
                  className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[var(--color-forest)] shrink-0"
                />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4 text-xs text-[var(--color-ink-soft)] leading-relaxed">
          Estimated time: <span className="font-medium text-[var(--color-ink)]">{step.estimatedMinutes} minutes</span>.{" "}
          {step.isFree
            ? "Included in the free tier."
            : "Available on Solo and Family plans."}
        </section>
      </div>
    </SlidePanel>
  );
}
