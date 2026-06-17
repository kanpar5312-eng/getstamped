import { PHASE_META } from "@/lib/steps";
import { CountUp } from "@/components/dashboard/CountUp";

const PHASE_LABELS: Record<number, string> = {
  1: "Before your I-20",
  2: "After I-20 arrival",
  3: "DS-160 and fees",
  4: "Interview prep",
  5: "Post-approval",
};

export function PhaseStepper({
  currentPhase,
  stepsComplete,
}: {
  currentPhase: number | null;
  stepsComplete: number;
}) {
  const effectiveCurrent = currentPhase ?? 6;

  return (
    <section
      data-stagger=""
      style={{ "--stagger-index": 0 } as React.CSSProperties}
    >
      <header className="flex items-baseline justify-between gap-4">
        <span data-eyebrow="">Visa journey</span>
        <span className="text-[13px] text-[var(--stone)] tabular-nums">
          <CountUp value={stepsComplete} /> of 47 steps
        </span>
      </header>

      <div className="phase-stepper mt-4">
        <span className="phase-track" aria-hidden />
        <ol className="phase-row">
          {PHASE_META.map((p) => {
            const state =
              p.number < effectiveCurrent
                ? "complete"
                : p.number === effectiveCurrent
                ? "current"
                : "upcoming";
            return (
              <li key={p.id} className="phase-step" data-state={state}>
                <span className="phase-step-dot" aria-hidden />
                <span className="phase-step-label">
                  Phase {p.number} · {PHASE_LABELS[p.number] ?? p.name}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
