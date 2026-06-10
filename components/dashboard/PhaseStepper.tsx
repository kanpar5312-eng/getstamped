import { PHASE_META } from "@/lib/steps";

/**
 * 5-phase visa journey stepper. Always visible at the top of the dashboard
 * home page so the surface never reads as purposeless.
 *
 *   • Complete phases — ink-filled dot, ink label
 *   • Current phase  — ember dot with soft ring, ember label
 *   • Upcoming       — stone outline, stone label
 *
 * Renders inline. Pulls phase data from PHASE_META + the dashboard's
 * computed `currentPhase`. No client-side state.
 */
export function PhaseStepper({
  currentPhase,
  stepsComplete,
}: {
  currentPhase: number | null;
  stepsComplete: number;
}) {
  // If no current phase (visa stamped, etc.), treat all 5 as complete.
  const effectiveCurrent = currentPhase ?? 6;

  return (
    <section data-stagger="" style={{ "--stagger-index": 0 } as React.CSSProperties}>
      <header className="flex items-baseline justify-between gap-4">
        <span data-eyebrow="">Visa journey</span>
        <span className="text-[12px] text-[var(--stone,#8E8985)] tabular-nums">
          {stepsComplete} of 47 steps
        </span>
      </header>

      <ol className="phase-stepper mt-4 list-none p-0">
        {PHASE_META.map((p, i) => {
          const state =
            p.number < effectiveCurrent
              ? "complete"
              : p.number === effectiveCurrent
              ? "current"
              : "upcoming";
          const railState = p.number < effectiveCurrent ? "complete" : "upcoming";
          return (
            <li
              key={p.id}
              className="phase-step"
              data-state={state}
            >
              <div className="flex items-center w-full">
                <span className="phase-step-dot" aria-hidden />
                {i < PHASE_META.length - 1 && (
                  <span className="phase-step-rail" data-state={railState} aria-hidden />
                )}
              </div>
              <span className="phase-step-label">
                Phase {p.number} · {p.name}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
