"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Eyebrow } from "./primitives/Eyebrow";

/* ════════════════════════════════════════════════════════════════════════
   VsConsultants — "Why GetStamped" trust section. Sits between
   StackedFeatureCards and Pricing (see MarketingLanding.tsx).

   V3 PASS — fixes theme + scale + balance, keeps the v2 content as-is
   (real scoring criteria from app/api/mock-interview/finish/route.ts
   and score/route.ts; no fabricated Q&A, no fabricated stats):

     • THEME: header already used the shared `.v3-h2`/`.v3-lead` classes
       (same tokens Pricing.tsx/Hero use), but the two card panels used
       smaller ad-hoc sizes and one plain cream-soft box next to one
       fixed-dark box — inconsistent with itself even before touching
       dark-mode. Both panels are now the SAME "app screenshot" chrome-
       frame treatment (dark, fixed palette — same convention
       StackedFeatureCards.tsx's DemoFrame already established: those
       demo stages are deliberately NOT theme-toggle-following, since
       they're meant to read as screenshots of the product's own UI).
       The section's own background still uses the exact same
       var(--color-cream) token Hero/Pricing use, so it can never drift
       from the page's actual background color.
     • SCALE: kickers now use the shared `Eyebrow` primitive (identical
       to every other section's eyebrow) instead of a smaller custom
       label; card headlines bumped to a real subhead size; criteria
       body copy and the reps stat bumped to reading-body / display-
       number scale instead of fine print.
     • BALANCE: both panels are now the same chrome-framed dark mock —
       a matched pair — instead of one dark terminal next to one plain
       light card.

   Legal posture (unchanged): no named competitors, no outcome/approval-
   odds claims, no fabricated statistics or testimonials. The "30
   sessions" figure is transparent multiplication from the real,
   published Solo plan limit (lib/checkLimit.ts: 5/week) shown as
   arithmetic in the fine print. The scoring criteria are quoted/closely
   paraphrased from the real system prompts, not invented. Never frames
   GetStamped as a replacement for a person.

   Motion: same scroll-gated IntersectionObserver → `.is-playing`
   pattern as before (no new library). Reps count up via
   requestAnimationFrame with a synced fill bar; scoring criteria reveal
   line-by-line staggered; a small "Analyzing… → Criteria locked"
   status-label swap in the criteria frame's chrome bar.
   ═════════════════════════════════════════════════════════════════════════

*/

const PERSIMMON = "var(--color-persimmon)";
const PERSIMMON_DEEP = "var(--color-persimmon-deep)";
const INK = "var(--color-ink)";
const INK_SOFT = "var(--color-ink-soft)";
const CREAM = "var(--color-cream)";

// Fixed dark palette for the "app screenshot" panels — matches
// StackedFeatureCards.tsx's DemoFrame convention of NOT following the
// site's light/dark theme toggle, since these read as screenshots of
// the product's own (always-dark) mock-interview stage, not chrome
// that should re-skin with the page.
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
        {/* Header — same v3-h2 / v3-lead scale as every other section */}
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

        {/* Two matched panels — same chrome-frame treatment */}
        <div className="gs-why-main">
          {/* Practice volume */}
          <div className="gs-why-panel gs-why-card--body" data-i={0}>
            <Eyebrow>Practice volume</Eyebrow>
            <h3 className="gs-why-h3 v3-mt-6">
              Repetition beats a single polished session.
            </h3>
            <div className="gs-why-frame v3-mt-6" aria-hidden>
              <FrameBar title="Practice volume" />
              <div className="gs-why-frame-body gs-why-reps-body">
                <div className="gs-why-reps-row">
                  <span className="gs-why-reps-row-label">
                    A human mock session
                  </span>
                  <span className="gs-why-reps-row-value gs-why-reps-row-value--muted">
                    $50–150 · realistically one shot, maybe two
                  </span>
                </div>
                <div className="gs-why-reps-row gs-why-reps-row--us">
                  <span className="gs-why-reps-row-label">
                    With GetStamped
                  </span>
                  <RepsBlock target={REPS_TARGET} playing={playing} reduced={reduced} />
                </div>
              </div>
            </div>
            <p className="gs-why-fine">
              {WEEKLY_MOCKS}/week × {PREP_WEEKS} weeks of typical prep —
              the real Solo plan limit, not a promise of infinity.
            </p>
          </div>

          {/* Feedback specificity — real scoring criteria */}
          <div className="gs-why-panel gs-why-panel--criteria gs-why-card--body" data-i={1}>
            <Eyebrow>Feedback, not a black box</Eyebrow>
            <h3 className="gs-why-h3 v3-mt-6">
              The literal criteria your answers get scored against.
            </h3>
            <div className="gs-why-frame v3-mt-6" aria-hidden>
              <FrameBar
                title="Mock interview · scoring"
                status={<span className="gs-why-frame-status" />}
              />
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
              Pulled directly from the grading logic in the product — not a
              mockup.
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
          grid-template-columns: 1fr 1.2fr;
          gap: clamp(20px, 2.6vw, 32px);
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .gs-why-main { grid-template-columns: 1fr; }
        }
        .gs-why-panel {
          position: relative;
          display: flex;
          flex-direction: column;
        }

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

        /* Card subhead — a real subhead, not fine print */
        .gs-why-h3 {
          font-family: var(--font-display-stack);
          font-style: italic;
          font-weight: 400;
          font-size: clamp(26px, 2.8vw, 32px);
          line-height: 1.2;
          letter-spacing: -0.012em;
          color: ${INK};
          max-width: 22ch;
        }
        .gs-why-fine {
          margin-top: 16px;
          font-family: var(--font-sans-stack);
          font-size: 13.5px;
          line-height: 1.55;
          color: ${INK_SOFT};
        }

        /* ── Shared chrome-frame — both panels use this ─────────────── */
        .gs-why-frame {
          flex: 1;
          border-radius: 16px;
          overflow: hidden;
          background: ${SCREEN_INK};
          box-shadow: 0 26px 60px -28px rgba(11,30,63,0.36);
          display: flex;
          flex-direction: column;
        }
        .gs-why-frame-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
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
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(250,248,244,0.55);
        }
        .gs-why-frame-status {
          margin-left: auto;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${PERSIMMON};
        }
        .gs-why-frame-status::before { content: "Analyzing…"; }
        .gs-vs.is-playing .gs-why-panel--criteria .gs-why-frame-status::before {
          animation: gs-why-status 10ms steps(1, end) 1500ms forwards;
        }
        @keyframes gs-why-status { to { content: "Criteria locked"; } }

        .gs-why-frame-body {
          flex: 1;
          padding: 22px 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          justify-content: center;
        }

        /* ── Practice-volume panel content ───────────────────────────── */
        .gs-why-reps-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px 0;
        }
        .gs-why-reps-row + .gs-why-reps-row {
          border-top: 1px solid rgba(250,248,244,0.12);
        }
        .gs-why-reps-row-label {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(250,248,244,0.5);
        }
        .gs-why-reps-row-value {
          font-family: var(--font-sans-stack);
          font-size: 16px;
          line-height: 1.4;
          color: ${SCREEN_PAPER};
        }
        .gs-why-reps-row-value--muted { color: rgba(250,248,244,0.62); }
        .gs-why-reps-count-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .gs-why-reps-count {
          font-family: var(--font-display-stack);
          font-size: clamp(42px, 5vw, 56px);
          font-weight: 400;
          letter-spacing: -0.02em;
          color: ${PERSIMMON};
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .gs-why-reps-suffix {
          font-family: var(--font-sans-stack);
          font-size: 15px;
          color: ${SCREEN_PAPER};
        }
        .gs-why-reps-bar {
          display: block;
          margin-top: 12px;
          height: 5px;
          border-radius: 999px;
          background: rgba(250,248,244,0.14);
          overflow: hidden;
        }
        .gs-why-reps-bar-fill {
          display: block;
          height: 100%;
          background: ${PERSIMMON};
          border-radius: 999px;
          transition: width 80ms linear;
        }

        /* ── Scoring-criteria panel content ──────────────────────────── */
        .gs-why-crit-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-bottom: 16px;
          border-bottom: 1px dashed rgba(250,248,244,0.16);
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
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${PERSIMMON};
        }
        .gs-why-crit-text {
          font-family: var(--font-sans-stack);
          font-size: 16px;
          line-height: 1.6;
          color: ${SCREEN_PAPER};
        }

        /* ── Risk-reversal strip ──────────────────────────────────────── */
        .gs-why-refund-strip {
          margin-top: clamp(20px, 2.4vw, 26px);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 20px clamp(22px, 3vw, 30px);
          border-radius: 16px;
          background: rgba(232, 98, 42, 0.08);
          border: 1px solid rgba(232, 98, 42, 0.2);
        }
        html.dark .gs-why-refund-strip {
          background: rgba(232, 98, 42, 0.14);
          border-color: rgba(232, 98, 42, 0.3);
        }
        .gs-why-refund-badge {
          display: inline-flex;
          align-items: center;
          flex: 0 0 auto;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #FFFDF7;
          background: ${PERSIMMON};
          padding: 9px 18px;
          border-radius: 999px;
        }
        .gs-why-refund-copy {
          flex: 1 1 280px;
          font-family: var(--font-sans-stack);
          font-size: 16px;
          line-height: 1.55;
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

/* ─────────────────────────────────────────────────────── chrome bar ── */

function FrameBar({ title, status }: { title: string; status?: ReactNode }) {
  return (
    <div className="gs-why-frame-bar">
      <span className="gs-why-dot" style={{ background: "#FF5F57" }} />
      <span className="gs-why-dot" style={{ background: "#FEBC2E" }} />
      <span className="gs-why-dot" style={{ background: "#28C840" }} />
      <span className="gs-why-frame-title">{title}</span>
      {status}
    </div>
  );
}

/* ─────────────────────────────────────── practice-reps stat block ── */

/** Counts up from 0 to `target` once the section is in view, plus a
 *  fill bar synced to the same progress — same requestAnimationFrame +
 *  eased-cubic technique as the animated counters/progress fills
 *  already used elsewhere in v3, reimplemented locally since those
 *  live in a different component's private scope. */
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
    <span className="gs-why-reps-row-value">
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
