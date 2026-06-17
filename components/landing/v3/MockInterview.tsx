"use client";

import { useEffect, useState } from "react";
import { Eyebrow } from "./primitives/Eyebrow";
import { PullQuote } from "./primitives/PullQuote";

export function MockInterview() {
  return (
    <section className="v3-section v3-moment v3-moment-left">
      <div className="v3-moment-visual">
        <InterviewMock />
      </div>
      <div className="v3-moment-copy">
        <Eyebrow>Mock Interview</Eyebrow>
        <h2 className="v3-h2 v3-mt-6">
          Hear every question{" "}
          <span className="v3-italic v3-persimmon">before</span> they ask it.
        </h2>
        <p className="v3-lead v3-mt-6">
          A voice-driven officer asks real F-1 questions. You answer out loud.
          We score you on the four things consular officers actually grade —
          clarity, confidence, specificity, and your financial story.
        </p>
        <ul className="v3-bullets v3-mt-6">
          <li><span className="v3-check" aria-hidden />200+ real questions, weighted by frequency</li>
          <li><span className="v3-check" aria-hidden />Voice in, voice out, transcript saved</li>
          <li><span className="v3-check" aria-hidden />Replay your worst answer first</li>
        </ul>
        <PullQuote attribution="Ji-min P. · Master's · Seoul" className="v3-mt-10">
          Brutal in the best way. By the real one I&rsquo;d already heard every
          variant of the question.
        </PullQuote>
      </div>
    </section>
  );
}

function InterviewMock() {
  return (
    <div className="v3-mock-stage" aria-hidden>
      <div className="v3-mock v3-mock-q-card">
        <span className="v3-mono v3-mock-meta">Question 04 / 12</span>
        <p className="v3-mock-q">
          <span className="v3-italic v3-typewriter">
            Why this university over the others that admitted you?
            <span className="v3-caret" aria-hidden />
          </span>
        </p>
        <div className="v3-mic">
          {Array.from({ length: 14 }).map((_, idx) => (
            <span key={idx} style={{ animationDelay: `${idx * 90}ms` }} />
          ))}
        </div>
      </div>
      <div className="v3-mock v3-mock-score-card">
        <span className="v3-mono v3-mock-meta">Officer rubric</span>
        <div className="v3-scores">
          <Score label="Clarity" target={94} />
          <Score label="Confidence" target={88} />
          <Score label="Specificity" target={91} />
          <Score label="Financials" target={76} />
        </div>
      </div>
      <div className="v3-mock v3-mock-transcript-card">
        <span className="v3-mono v3-mock-meta">Transcript · 00:14</span>
        <p className="v3-transcript">
          &ldquo;I chose Purdue because the IE program publishes more in
          stochastic optimization than any school that admitted me, and
          Professor Rao&rsquo;s lab — &rdquo;
        </p>
      </div>
    </div>
  );
}

function Score({ label, target }: { label: string; target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(target);
      return;
    }
    let raf = 0;
    let cycleStart = performance.now();
    const dur = 1400;
    const hold = 3000;
    const tick = (t: number) => {
      const elapsed = t - cycleStart;
      if (elapsed < dur) {
        const p = elapsed / dur;
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(eased * target));
      } else if (elapsed < dur + hold) {
        setN(target);
      } else {
        cycleStart = t;
        setN(0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <div className="v3-score">
      <span className="v3-score-label">{label}</span>
      <span className="v3-score-num v3-mono">{n}</span>
    </div>
  );
}
