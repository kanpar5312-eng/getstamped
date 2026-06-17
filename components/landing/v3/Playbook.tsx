import { Eyebrow } from "./primitives/Eyebrow";
import { PHASE_META } from "@/lib/steps";

const RANGE: Record<number, { range: string; time: string }> = {
  1: { range: "Steps 01 — 06", time: "~6 weeks" },
  2: { range: "Steps 07 — 17", time: "~3 weeks" },
  3: { range: "Steps 18 — 28", time: "~2 weeks" },
  4: { range: "Steps 29 — 40", time: "~2 weeks" },
  5: { range: "Steps 41 — 47", time: "~1 week" },
};

export function Playbook() {
  return (
    <section id="playbook" className="v3-section v3-playbook">
      <div className="v3-playbook-grid">
        <div className="v3-playbook-left">
          <Eyebrow>The 47-step playbook</Eyebrow>
          <h2 className="v3-h2 v3-mt-6">
            Forty-seven steps.
            <br />
            <span className="v3-italic">We&rsquo;ve taken them apart.</span>
          </h2>
          <p className="v3-lead v3-mt-6">
            Most students miss a single document. We don&rsquo;t let you. Every
            phase is ordered, estimated, and annotated by people who&rsquo;ve
            sat in front of the officer.
          </p>
        </div>
        <ol className="v3-phase-list">
          {PHASE_META.map((p, idx) => (
            <li
              key={p.number}
              className="v3-phase-row"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="v3-phase-meta-row">
                <span className="v3-mono v3-phase-num">PHASE 0{p.number}</span>
                <span className="v3-mono v3-phase-time">
                  {RANGE[p.number].range} · {RANGE[p.number].time}
                </span>
              </div>
              <h3 className="v3-phase-name">{p.name}</h3>
              <span className="v3-phase-rule" />
            </li>
          ))}
        </ol>
      </div>

      <div className="v3-playbook-anno" aria-hidden>
        <svg viewBox="0 0 220 110" width="220" height="110">
          <path
            d="M 10 92 C 30 60, 70 36, 130 30"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M 122 22 L 132 30 L 122 38"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="v3-anno-label">Phase 1 is free forever.</span>
      </div>
    </section>
  );
}
