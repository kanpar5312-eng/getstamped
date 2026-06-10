import { Fragment } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";

const STEPS = [
  {
    n: "01",
    title: "Sign up free",
    body:
      "No card. Phase 1 is free forever. See exactly what’s inside before you commit to anything.",
  },
  {
    n: "02",
    title: "Get your timeline",
    body:
      "Tell us your intake date and university. We generate your personalized 47-step timeline in seconds.",
  },
  {
    n: "03",
    title: "Follow each step",
    body:
      "Each step has plain-English instructions, document checklists, common mistakes, and an AI you can ask anything.",
  },
];

function Connector() {
  return (
    <div
      aria-hidden
      className="hidden lg:flex items-center mt-9 px-2 col-span-1 self-start"
    >
      <span className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] mx-2" />
      <span className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full bg-[var(--color-cream)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-snug text-[var(--color-ink)]">
            From your I-20 to your visa stamp.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-8 lg:gap-4 items-start">
          {STEPS.map((s, i) => (
            <Fragment key={s.n}>
              <div>
                <div className="font-display text-5xl tracking-tight text-[var(--color-forest)] tabular-nums leading-none">
                  {s.n}
                </div>
                <h3 className="mt-4 text-base font-medium text-[var(--color-ink)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)] max-w-xs">
                  {s.body}
                </p>
              </div>
              {i < STEPS.length - 1 && <Connector />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
