"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "./primitives/Eyebrow";

/* ════════════════════════════════════════════════════════════════════════
   VsConsultants — "Why GetStamped" trust section. Sits between
   StackedFeatureCards and Pricing (see MarketingLanding.tsx).

   REDESIGN NOTE (replaces the earlier 5-row "Traditional Consultant vs
   GetStamped" comparison table):
     The old table worked axis-by-axis ("when you can ask", "who sets
     the pace"...) but every row was a one-line abstraction, and the
     two-column consultant-vs-us format inherently invited a "we beat a
     human" reading — which this product should NOT claim (a
     human-reviewed tier may ship later; nothing here should contradict
     that). Replaced with three focused "why this works" cards, each
     built around a single concrete, provable claim instead of five
     abstract comparisons:
       1. Practice volume — reframes "unlimited mock interviews" as
          real arithmetic (published plan limit × a typical prep
          window), not a vague superlative.
       2. Feedback specificity — an actual sample of the kind of
          structured, criteria-based feedback the product gives,
          tone-matched to lib/steps.ts and the real mock-interview hint
          copy (MockInterviewClient.tsx's shortAnswerHint/
          decentAnswerHint) — "how do I know it's not a black box"
          answered by showing, not asserting.
       3. Risk reversal — the real, already-live 14-day refund line
          from Pricing.tsx, verbatim.
     None of the three ever says "instead of a person" or "no human
     needed" — framed as why this kind of preparation holds up on its
     own terms, not as a replacement for anything.

   Legal posture (unchanged from the previous version):
     • No named competitors, no outcome/approval-odds claims, no
       fabricated statistics or testimonials.
     • The "30 sessions" figure is transparent multiplication from the
       real, published Solo plan limit (lib/checkLimit.ts:
       MOCK_INTERVIEW_WEEKLY_LIMIT.solo = 5/week) — shown as arithmetic
       in the fine print, never presented as a measured average.
     • The feedback example is illustrative — clearly framed as a
       sample, not a transcript of a real user.

   Motion: same scroll-gated reveal system as the previous version (one
   IntersectionObserver flips `.is-playing` once ≥25% of the section is
   in view; every animation is CSS, paused until then). The typewriter
   feedback reveal reuses the same clip-path-steps technique already
   established in app/../Styles.tsx's .v3-typewriter (used by the Mock
   Interview feature card) — reimplemented locally here (scoped
   .gs-why-type) rather than importing that class, since its keyframe
   timing is hand-tuned to a different, shorter string and loops
   infinitely, which doesn't fit a reveal-once feedback line.
   ═════════════════════════════════════════════════════════════════════════ */

const PERSIMMON = "var(--color-persimmon)";
const PERSIMMON_DEEP = "var(--color-persimmon-deep)";
const INK = "var(--color-ink)";
const INK_SOFT = "var(--color-ink-soft)";
const CREAM = "var(--color-cream)";
const STONE = "rgba(11, 30, 63, 0.10)";

// Real, published plan limit (lib/checkLimit.ts) — the Solo plan's
// weekly mock-interview cap. Used only for the honest multiplication
// below ("5/week × 6 weeks"), never presented as a measured statistic.
const WEEKLY_MOCKS = 5;
const PREP_WEEKS = 6;
const REPS_TARGET = WEEKLY_MOCKS * PREP_WEEKS; // 30

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
            Three honest reasons this kind of preparation holds up — shown,
            not promised. No outcome claims, just how the practice actually
            works.
          </p>
        </header>

        {/* Three proof cards */}
        <div className="gs-why-grid">
          {/* 1 — practice volume, made concrete */}
          <article className="gs-why-card gs-why-card--body" data-i={0}>
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
                <span className="gs-why-reps-value">
                  <RepsCounter target={REPS_TARGET} playing={playing} reduced={reduced} />
                  <span className="gs-why-reps-suffix">sessions before you sit down</span>
                </span>
              </div>
            </div>
            <p className="gs-why-fine">
              {WEEKLY_MOCKS}/week × {PREP_WEEKS} weeks of typical prep — every
              week, not once.
            </p>
          </article>

          {/* 2 — feedback specificity, shown not claimed */}
          <article className="gs-why-card gs-why-card--body" data-i={1}>
            <p className="gs-why-kicker">Feedback, not a black box</p>
            <h3 className="gs-why-h3">Specific enough to actually fix.</h3>
            <div className="v3-mock gs-why-feedback" aria-hidden>
              <p className="gs-why-feedback-line gs-why-feedback-q">
                <span className="gs-why-feedback-meta">Officer asks</span>
                Why should I believe you&rsquo;ll return home after graduation?
              </p>
              <p className="gs-why-feedback-line gs-why-feedback-a">
                <span className="gs-why-feedback-meta">You answer</span>
                &ldquo;Because my family is there and I love my country.&rdquo;
              </p>
              <p className="gs-why-feedback-line gs-why-feedback-fb">
                <span className="gs-why-feedback-meta">Feedback</span>
                <span className="gs-why-type">
                  Too general — no named anchor. Officers weigh specifics: a
                  job offer, a family business, a return date.
                  <span className="gs-why-caret" aria-hidden />
                </span>
              </p>
            </div>
            <p className="gs-why-fine">
              Sample feedback, in the same tone the mock interview actually
              gives — not a real transcript.
            </p>
          </article>

          {/* 3 — risk reversal */}
          <article className="gs-why-card gs-why-card--body" data-i={2}>
            <p className="gs-why-kicker">Risk reversal</p>
            <h3 className="gs-why-h3">Nothing to lose, trying it.</h3>
            <div className="gs-why-refund">
              <span className="gs-why-refund-badge">14-day refund</span>
              <p className="gs-why-refund-copy">
                No exit interview, no forms. Email and the money is back.
              </p>
            </div>
            <p className="gs-why-fine">
              Try the practice before you have to trust it.
            </p>
          </article>
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

        /* ── Three-card grid ─────────────────────────────────────────── */
        .gs-why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(18px, 2.2vw, 24px);
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .gs-why-grid { grid-template-columns: 1fr; }
        }
        .gs-why-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: var(--color-cream-soft);
          border: 1px solid ${STONE};
          border-radius: 20px;
          padding: clamp(22px, 2.6vw, 28px);
          box-shadow: 0 20px 48px -30px rgba(11,30,63,0.16);
        }
        html.dark .gs-why-card { border-color: rgba(245, 241, 232, 0.12); }

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

        /* Card 1 — reps comparison block */
        .gs-why-reps {
          margin-top: 18px;
          border: 1px solid ${STONE};
          border-radius: 12px;
          overflow: hidden;
        }
        .gs-why-reps-row {
          display: flex;
          flex-direction: column;
          gap: 5px;
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
        .gs-why-reps-row--us .gs-why-reps-value {
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

        /* Card 2 — feedback sample (.v3-mock is the shared mock-surface
           class from Styles.tsx — reused as-is, no new surface style). */
        .gs-why-feedback {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .gs-why-feedback-meta {
          display: block;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-muted);
          margin-bottom: 4px;
        }
        .gs-why-feedback-line { font-size: 14px; line-height: 1.5; }
        .gs-why-feedback-q {
          font-family: var(--font-display-stack);
          font-size: 16.5px;
          line-height: 1.35;
          color: ${INK};
        }
        .gs-why-feedback-a {
          font-family: var(--font-sans-stack);
          font-style: italic;
          color: ${INK_SOFT};
        }
        .gs-why-feedback-fb {
          font-family: var(--font-sans-stack);
          font-weight: 500;
          color: ${PERSIMMON_DEEP};
          padding-top: 10px;
          border-top: 1px dashed ${STONE};
        }
        .gs-why-type {
          display: inline;
          position: relative;
          clip-path: inset(0 100% 0 0);
        }
        .gs-vs.is-playing .gs-why-card--body[data-i="1"] .gs-why-type {
          animation: gs-why-type-in 1300ms steps(60, end) 950ms forwards;
        }
        @keyframes gs-why-type-in {
          to { clip-path: inset(0 0 0 0); }
        }
        .gs-why-caret {
          display: inline-block;
          width: 2px; height: 0.95em;
          margin-left: 2px;
          vertical-align: -2px;
          background: ${PERSIMMON};
          opacity: 0;
        }
        .gs-vs.is-playing .gs-why-card--body[data-i="1"] .gs-why-caret {
          animation: gs-why-blink 0.9s steps(1, end) 950ms 3;
        }
        @keyframes gs-why-blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }

        /* Card 3 — refund badge */
        .gs-why-refund {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .gs-why-refund-badge {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #FFFDF7;
          background: ${PERSIMMON};
          padding: 7px 14px;
          border-radius: 999px;
        }
        .gs-why-refund-copy {
          font-family: var(--font-sans-stack);
          font-size: 14.5px;
          line-height: 1.5;
          color: ${INK};
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
          .gs-vs-title, .gs-why-card--body, .gs-vs-closer {
            opacity: 1 !important;
            transform: none !important;
          }
          .gs-why-type { clip-path: inset(0 0 0 0) !important; }
          .gs-why-caret { display: none !important; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────── practice-reps counter ── */

/** Counts up from 0 to `target` once the section is in view. Same
 *  requestAnimationFrame + eased-cubic technique used for the score
 *  counters on the (currently unmounted) v3 Mock Interview feature
 *  card — reimplemented locally rather than imported, since that
 *  component isn't wired into the live page. */
function RepsCounter({
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

  return <span className="gs-why-reps-count">{n}+</span>;
}
