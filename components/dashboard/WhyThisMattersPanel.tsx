"use client";

import { SlidePanel } from "@/components/ui/SlidePanel";
import type { Step } from "@/lib/steps";
import type { HomeCountryCode } from "@/lib/home-countries";
import { resolveStepContent } from "@/lib/resolveStepContent";

type Props = {
  open: boolean;
  onClose: () => void;
  step: Step;
  homeCountry: HomeCountryCode | null;
};

function CountryBadge({ code }: { code: HomeCountryCode }) {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[var(--color-accent-deep)] align-middle">
      {code === "CA_ORIGIN" ? "CA" : code}
    </span>
  );
}

export function WhyThisMattersPanel({ open, onClose, step, homeCountry }: Props) {
  const resolved = resolveStepContent(step, homeCountry);

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
            {resolved.instructions.intro.text}
            {resolved.instructions.intro.overridden && homeCountry && (
              <CountryBadge code={homeCountry} />
            )}
          </p>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Documents needed
          </h3>
          <p className="mt-3 font-display text-3xl tracking-tight text-[var(--color-ink)] tabular-nums leading-none">
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
            {resolved.commonMistakes.map((m, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--color-ink)]"
              >
                <span
                  aria-hidden
                  className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shrink-0"
                />
                <span>
                  <span className="font-medium">
                    {m.title}.
                    {m.titleOverridden && homeCountry && <CountryBadge code={homeCountry} />}
                  </span>{" "}
                  <span className="text-[var(--color-ink-soft)]">
                    {m.body.text}
                    {m.body.overridden && !m.titleOverridden && homeCountry && (
                      <CountryBadge code={homeCountry} />
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Tips
          </h3>
          <ul className="mt-3 space-y-2">
            <li className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--color-ink)]">
              <span
                aria-hidden
                className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[var(--color-persimmon)] shrink-0"
              />
              <span>{resolved.whyItMatters}</span>
            </li>
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
