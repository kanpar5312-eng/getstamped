"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "./primitives/Eyebrow";

/* ════════════════════════════════════════════════════════════════════════
   VsConsultants — "Why GetStamped" trust section. Sits between
   StackedFeatureCards and Pricing (see MarketingLanding.tsx).

   V2 REDESIGN NOTE — fixes two real problems with the first pass at this
   section (three flat, equal-weight cards):

     1. CREDIBILITY BUG. The first version showed a fabricated Q&A —
        an invented question, an invented answer, an invented feedback
        line — labeled "sample... not a real transcript." That
        disclaimer undercut the entire point of the section (proving
        the feedback is specific, not generic praise): admitting the
        proof is fake reads worse than no proof at all. Fixed by
        showing the ACTUAL scoring criteria instead of a fake exchange
        — the three axes (clarity / confidence / red-flag) and their
        descriptions below are pulled directly from the system prompt
        in app/api/mock-interview/finish/route.ts's computeOverall()
        ("Scoring guidance" block) and the per-answer rules in
        app/api/mock-interview/score/route.ts. This is real, in the
        codebase right now, not illustrative copy — framed as "the
        literal criteria your answers get scored against," not a
        conversation.

     2. VISUAL IMBALANCE. Three co-equal cards read as generic/
        unfinished (the risk-reversal card in particular had almost no
        content next to the other two). Rebuilt as an asymmetric
        two-panel layout — a compact stat panel (practice volume) next
        to a larger "app screenshot" panel (scoring criteria, styled
        after the demo-frame language already established in
        StackedFeatureCards.tsx: dark chrome bar, traffic-light dots,
        mono meta labels) — with risk-reversal folded into a slim
        full-width strip underneath instead of competing as a third
        card. DemoFrame itself isn't exported from that file, so the
        chrome-bar treatment is reimplemented locally here (same
        recipe: fixed dark palette instead of theme tokens, matching
        that file's own "this is a screenshot, not chrome" choice) —
        not importing across files, per scope.

   Legal posture (unchanged):
     • No named competitors, no outcome/approval-odds claims, no
       fabricated statistics or testimonials.
     • The "30 sessions" figure is transparent multiplication from the
       real, published Solo plan limit (lib/checkLimit.ts:
       MOCK_INTERVIEW_WEEKLY_LIMIT.solo = 5/week), shown as arithmetic
       in the fine print — never presented as a measured average.
     • The scoring criteria are quoted/closely paraphrased from the
       actual system prompts, not invented.
     • Never frames GetStamped as a replacement for a person — every
       claim is about how the practice itself holds up.

   Motion: same scroll-gated reveal system as before — one
   IntersectionObserver flips `.is-playing` once ≥25% of the section
   is in view (no new library; this mirrors the rAF/observer pattern
   ScrollTransitions.tsx uses elsewhere on this page for its own
   section-boundary effects, reimplemented at the component scope
   since ScrollTransitions.tsx's own effect is hardcoded to specific
   section ids this component isn't one of). Reps count up via
   requestAnimationFrame; the scoring criteria reveal line-by-line with
   a small "Analyzing… → Criteria locked" status-label swap in the
   chrome bar (the connecting "it's actively evaluating something"
   touch called for — kept to one small effect, not a separate
   elaborate loop, to stay legible rather than busy).
   ═════════════════════════════════════════════════════════════════════════ */

const PERSIMMON = "var(--color-persimmon)";
const PERSIMMON_DEEP = "var(--color-persimmon-deep)";
const INK = "var(--color-ink)";
const INK_SOFT = "var(--color-ink-soft)";
const CREAM = "var(--color-cream)";
const STONE = "rgba(11, 30, 63, 0.10)";

// Fixed dark palette for the "app screenshot" criteria panel — matches
// StackedFeatureCards.tsx's DemoFrame convention of NOT following the
// site's light/dark theme toggle, since it's meant to read as a
// screenshot of the product's own (always-dark) mock-interview stage.
const SCREEN_INK = "#1C1917";
const SCREEN_PAPER = "#FAF8F4";

// Real, published plan limit (lib/checkLimit.ts) — the Solo plan's
// weekly mock-interview cap. Used only for the honest multiplication
// below ("5/week × 6 weeks"), never presented as a measured statistic.
const WEEKLY_MOCKS = 5;
const PREP_WEEKS = 6;
const REPS_TARGET = WEEKLY_MOCKS * PREP_WEEKS; // 30

// Real scoring axes, pulled from app/api/mock-interview/finish/route.ts's
// computeOverall() system prompt ("Scoring guidance") and the per-answer
// rules in app/api/mock-interview/score/route.ts. Not invented.
const CRITERIA = [
  {
    label: "Clarity",
    text: "How directly you answer — first-sentence anchoring, no rambling before the point.",
  },
  {
    label: "Confidence",
    text: "Definite verbs. No hedging, no filler, no “I think… kind of…”",
  },
  {
    label: "Red flags",
    text: "Weak ties home, funding gaps, evasive answers — flagged automatically.",
  },
];

export function VsConsultants() {
  const rootRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);
    if (reduce) {
      setPlaying(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.25) {
            setPlaying(true);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: [0.25] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-label="Why GetStamped works"
      className={`gs-vs ${playing ? "is-playing" : ""}`}
      style={{
        position: "relative",
        background: CREAM,
        padding: "clamp(72px, 9vw, 120px) clamp(20px, 5vw, 48px)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <header style={{ maxWidth: 720, marginBottom: "clamp(40px, 5vw, 64px)" }}>
          <Eyebrow>Why GetStamped</Eyebrow>
          <h2 className="v3-h2 v3-mt-6 gs-vs-title">
            Built on <em className="v3-italic v3-persimmon">reps</em>, not
            one polished shot.
          </h2>
          <p className="v3-lead v3-mt-6">
            Two honest reasons this kind of preparation holds up — shown, not
            promised. No outcome claims, just how the practice actually
            works.
          </p>
        </header>

        {/* Two-panel layout: compact reps stat + larger scoring-criteria screenshot */}
        <div className="gs-why-main">
          {/* Practice volume — compact stat panel */}
          <div className="gs-why-panel gs-why-card--body" data-i={0}>
            <p className="gs-why-kicker">Practice volume</p>
            <h3 className="gs-why-h3">
              Repetition beats a single polished session.
            </h3>
            <div className="gs-why-reps">
              <div className="gs-why-reps-row">
                <span className="gs-why-reps-label">A human mock session</span>
                <span className="gs-why-reps-value gs-why-reps-value--muted">
                  $50–150 · realistically one shot, maybe two
                </span>
              </div>
              <div className="gs-why-reps-row gs-why-reps-row--us">
                <span className="gs-why-reps-label">With GetStamped</span>
                <RepsBlock target={REPS_TARGET} playing={playing} reduced={reduced} />
              </div>
            </div>
            <p className="gs-why-fine">
              {WEEKLY_MOCKS}/week × {PREP_WEEKS} weeks of typical prep
              — the real Solo plan limit, not a promise of infinity.
            </p>
          </div>

          {/* Feedback specificity — app-screenshot-style scoring criteria */}
          <div className="gs-why-panel gs-why-panel--criteria gs-why-card--body" data-i={1}>
            <p className="gs-why-kicker">Feedback, not a black box</p>
            <h3 className="gs-why-h3">
              The literal criteria your answers get scored against.
            </h3>
            <div className="gs-why-frame" aria-hidden>
              <div className="gs-why-frame-bar">
                <span className="gs-why-dot" style={{ background: "#FF5F57" }} />
                <span className="gs-why-dot" style={{ background: "#FEBC2E" }} />
                <span className="gs-why-dot" style={{ background: "#28C840" }} />
                <span className="gs-why-frame-title">MOCK INTERVIEW · SCORING</span>
                <span className="gs-why-frame-status" />
              </div>
              <div className="gs-why-frame-body">
                {CRITERIA.map((c, i) => (
                  <div className="gs-why-crit-row" data-i={i} key={c.label}>
                    <span className="gs-why-crit-label">{c.label}</span>
                    <span className="gs-why-crit-text">{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="gs-why-fine">
              Pulled directly from the grading logic in the product —
              not a mockup.
            </p>
          </div>
        </div>

        {/* Risk reversal — slim supporting strip, not a co-equal card */}
        <div className="gs-why-refund-strip gs-why-card--body" data-i={2}>
          <span className="gs-why-refund-badge">14-day refund</span>
          <p className="gs-why-refund-copy">
            No exit interview, no forms. Email and the money is back — try
            the practice before you have to trust it.
          </p>
        </div>

        {/* Closer line — quiet, no overclaiming, no "vs a human" framing */}
        <p className="gs-vs-closer">
          The kind of ready that only shows up once you&rsquo;ve done it
          enough times to stop noticing you&rsquo;re practicing.
        </p>
      </div>

      <style>{`
        /* Hold every reveal animation until the section is in view. */
        .gs-vs *[data-anim] {
          animation-play-state: paused;
          animation-fill-mode: both;
        }
        .gs-vs.is-playing *[data-anim] {
          animation-play-state: running;
        }

        /* Title fade-up */
        .gs-vs-title {
          opacity: 0;
          transform: translateY(10px);
          animation: gs-vs-up 600ms cubic-bezier(0.22,1,0.36,1) both;
          animation-play-state: paused;
        }
        .gs-vs.is-playing .gs-vs-title { animation-play-state: running; }
        @keyframes gs-vs-up {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Two-panel layout ────────────────────────────────────────── */
        .gs-why-main {
          display: grid;
          grid-template-columns: 0.82fr 1.18fr;
          gap: clamp(18px, 2.4vw, 28px);
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .gs-why-main { grid-template-columns: 1fr; }
        }
        .gs-why-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          background: var(--color-cream-soft);
          border: 1px solid ${STONE};
          border-radius: 20px;
          padding: clamp(22px, 2.6vw, 28px);
          box-shadow: 0 20px 48px -30px rgba(11,30,63,0.16);
        }
        html.dark .gs-why-panel { border-color: rgba(245, 241, 232, 0.12); }

        .gs-why-card--body {
          opacity: 0;
          transform: translateY(10px);
        }
        .gs-vs.is-playing .gs-why-card--body {
          animation: gs-vs-up 560ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
        ${[0, 1, 2]
          .map(
            (i) =>
              `.gs-vs.is-playing .gs-why-card--body[data-i="${i}"] { animation-delay: ${
                160 + i * 150
              }ms; }`,
          )
          .join("\n")}

        .gs-why-kicker {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-weight: 600;
          color: ${PERSIMMON_DEEP};
        }
        .gs-why-h3 {
          margin-top: 10px;
          font-family: var(--font-display-stack);
          font-style: italic;
          font-weight: 400;
          font-size: clamp(19px, 2vw, 22px);
          line-height: 1.3;
          color: ${INK};
        }
        .gs-why-fine {
          margin-top: 16px;
          font-family: var(--font-sans-stack);
          font-size: 12.5px;
          line-height: 1.5;
          color: ${INK_SOFT};
        }

        /* ── Practice-volume panel ───────────────────────────────────── */
        .gs-why-reps {
          margin-top: 18px;
          border: 1px solid ${STONE};
          border-radius: 12px;
          overflow: hidden;
        }
        .gs-why-reps-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 13px 15px;
        }
        .gs-why-reps-row + .gs-why-reps-row {
          border-top: 1px solid ${STONE};
        }
        .gs-why-reps-row--us {
          background: rgba(232, 98, 42, 0.06);
        }
        html.dark .gs-why-reps-row--us { background: rgba(232, 98, 42, 0.12); }
        .gs-why-reps-label {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${INK_SOFT};
        }
        .gs-why-reps-value {
          font-family: var(--font-sans-stack);
          font-size: 13.5px;
          color: ${INK};
        }
        .gs-why-reps-value--muted { color: ${INK_SOFT}; }
        .gs-why-reps-count-row {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          font-size: 14.5px;
          font-weight: 500;
        }
        .gs-why-reps-count {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 26px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: ${PERSIMMON_DEEP};
        }
        .gs-why-reps-suffix { color: ${INK}; }
        .gs-why-reps-bar {
          display: block;
          margin-top: 10px;
          height: 4px;
          border-radius: 999px;
          background: rgba(232, 98, 42, 0.14);
          overflow: hidden;
        }
        .gs-why-reps-bar-fill {
          display: block;
          height: 100%;
          background: ${PERSIMMON};
          border-radius: 999px;
          transition: width 80ms linear;
        }

        /* ── Scoring-criteria "screenshot" panel ─────────────────────── */
        .gs-why-frame {
          margin-top: 18px;
          border-radius: 14px;
          overflow: hidden;
          background: ${SCREEN_INK};
          box-shadow: 0 24px 56px -28px rgba(11,30,63,0.34);
        }
        .gs-why-frame-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(250,248,244,0.04);
          border-bottom: 1px solid rgba(250,248,244,0.08);
        }
        .gs-why-dot {
          width: 9px; height: 9px;
          border-radius: 999px;
          flex: 0 0 auto;
        }
        .gs-why-frame-title {
          margin-left: 8px;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(250,248,244,0.55);
        }
        .gs-why-frame-status {
          margin-left: auto;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 9.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${PERSIMMON};
        }
        .gs-why-frame-status::before {
          content: "Analyzing…";
        }
        .gs-vs.is-playing .gs-why-panel--criteria .gs-why-frame-status::before {
          animation: gs-why-status 10ms steps(1, end) 1500ms forwards;
        }
        @keyframes gs-why-status {
          to { content: "Criteria locked"; }
        }
        .gs-why-frame-body {
          padding: 18px 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .gs-why-crit-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-bottom: 14px;
          border-bottom: 1px dashed rgba(250,248,244,0.14);
          opacity: 0;
          transform: translateY(6px);
        }
        .gs-why-crit-row:last-child { border-bottom: none; padding-bottom: 0; }
        .gs-vs.is-playing .gs-why-panel--criteria .gs-why-crit-row {
          animation: gs-why-crit-in 480ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
        ${[0, 1, 2]
          .map(
            (i) =>
              `.gs-vs.is-playing .gs-why-panel--criteria .gs-why-crit-row[data-i="${i}"] { animation-delay: ${
                420 + i * 260
              }ms; }`,
          )
          .join("\n")}
        @keyframes gs-why-crit-in {
          to { opacity: 1; transform: translateY(0); }
        }
        .gs-why-crit-label {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${PERSIMMON};
        }
        .gs-why-crit-text {
          font-family: var(--font-sans-stack);
          font-size: 14px;
          line-height: 1.5;
          color: ${SCREEN_PAPER};
        }

        /* ── Risk-reversal strip ──────────────────────────────────────── */
        .gs-why-refund-strip {
          margin-top: clamp(18px, 2.2vw, 24px);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          padding: 18px clamp(20px, 3vw, 28px);
          border-radius: 16px;
          background: rgba(232, 98, 42, 0.06);
          border: 1px solid rgba(232, 98, 42, 0.18);
        }
        html.dark .gs-why-refund-strip {
          background: rgba(232, 98, 42, 0.12);
          border-color: rgba(232, 98, 42, 0.28);
        }
        .gs-why-refund-badge {
          display: inline-flex;
          align-items: center;
          flex: 0 0 auto;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #FFFDF7;
          background: ${PERSIMMON};
          padding: 8px 16px;
          border-radius: 999px;
        }
        .gs-why-refund-copy {
          flex: 1 1 260px;
          font-family: var(--font-sans-stack);
          font-size: 14.5px;
          line-height: 1.5;
          color: ${INK};
          margin: 0;
        }

        /* Closer fade-up */
        .gs-vs-closer {
          margin: clamp(32px, 4vw, 48px) 0 0;
          font-family: var(--font-display-stack);
          font-size: clamp(20px, 2.6vw, 30px);
          font-style: italic;
          line-height: 1.35;
          color: ${INK_SOFT};
          max-width: 720px;
          opacity: 0;
          transform: translateY(8px);
          animation: gs-vs-up 700ms cubic-bezier(0.22,1,0.36,1) 1050ms both;
          animation-play-state: paused;
        }
        .gs-vs.is-playing .gs-vs-closer { animation-play-state: running; }

        @media (prefers-reduced-motion: reduce) {
          .gs-vs * { animation: none !important; transition: none !important; }
          .gs-vs-title, .gs-why-card--body, .gs-vs-closer, .gs-why-crit-row {
            opacity: 1 !important;
            transform: none !important;
          }
          .gs-why-frame-status::before { content: "Criteria locked" !important; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────── practice-reps stat block ── */

/** Counts up from 0 to `target` once the section is in view, plus a
 *  fill bar synced to the same progress — same requestAnimationFrame +
 *  eased-cubic technique as the animated counters/progress fills
 *  already used elsewhere in v3 (StackedFeatureCards' progress bars,
 *  the count-swap labels), reimplemented locally rather than imported
 *  since those live in a different component's private scope. */
function RepsBlock({
  target,
  playing,
  reduced,
}: {
  target: number;
  playing: boolean;
  reduced: boolean;
}) {
  const [n, setN] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced, target]);

  const pct = Math.min(100, Math.round((n / target) * 100));

  return (
    <span className="gs-why-reps-value">
      <span className="gs-why-reps-count-row">
        <span className="gs-why-reps-count">{n}+</span>
        <span className="gs-why-reps-suffix">sessions before you sit down</span>
      </span>
      <span className="gs-why-reps-bar" aria-hidden>
        <span className="gs-why-reps-bar-fill" style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
}
