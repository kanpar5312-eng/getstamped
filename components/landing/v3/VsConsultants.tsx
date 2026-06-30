"use client";

import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   VsConsultants — clean, restrained side-by-side differentiation block.
   Sits between StackedFeatureCards and Pricing. Purely additive.

   Replaces the earlier arcade-cutscene with something parents will
   read seriously. No video, no game theatrics. The only motion is a
   per-row reveal on scroll-into-view: each comparison row slides up,
   the persimmon underline beneath the GetStamped answer draws in,
   then a small ✓ marker pops. That's it.

   Legal posture:
     • Comparison is against a generic category ("traditional
       consultancies"), never a named competitor.
     • Every claim is either descriptive of OUR product or a hedged,
       commonly-accepted truth about the category (office hours,
       in-person mocks, etc.). No outcome promises, no disparagement.
     • No pricing.
   ═════════════════════════════════════════════════════════════════════════ */

const PERSIMMON = "#E8622A";
const PERSIMMON_DEEP = "#B85A15";
const INK = "#0B1E3F";
const INK_SOFT = "#2A3F5F";
const CREAM = "#F5F1E8";
const STONE = "rgba(11, 30, 63, 0.10)";

type Row = {
  axis: string;
  consultant: string;
  getstamped: string;
  /** Word inside `getstamped` we want underlined in persimmon. */
  emphasis?: string;
};

const ROWS: Row[] = [
  {
    axis: "When you can ask",
    consultant: "During office hours, by appointment.",
    getstamped: "Anytime, any day — the workspace is always on.",
    emphasis: "Anytime, any day",
  },
  {
    axis: "How documents get checked",
    consultant: "Reviewed page-by-page in a meeting.",
    getstamped: "AI reads every page in seconds and flags formatting issues.",
    emphasis: "every page in seconds",
  },
  {
    axis: "Mock interviews",
    consultant: "One or two sessions, in person.",
    getstamped: "Practise out loud as many times as you want, with feedback.",
    emphasis: "as many times as you want",
  },
  {
    axis: "What you take home",
    consultant: "A verbal summary you try to remember.",
    getstamped: "The full 47-step playbook, dated, in your pocket.",
    emphasis: "47-step playbook, dated, in your pocket",
  },
  {
    axis: "Who sets the pace",
    consultant: "Their calendar.",
    getstamped: "Yours.",
    emphasis: "Yours",
  },
];

export function VsConsultants() {
  const rootRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      aria-label="Why GetStamped vs. a consultant"
      className={`gs-vs ${playing ? "is-playing" : ""}`}
      style={{
        position: "relative",
        background: CREAM,
        padding: "clamp(72px, 9vw, 120px) clamp(20px, 5vw, 48px)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>
        {/* Header — tight, three lines max, no theatrics */}
        <header style={{ maxWidth: 720, marginBottom: "clamp(40px, 5vw, 64px)" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 11,
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              color: PERSIMMON,
              fontWeight: 600,
            }}
          >
            Why GetStamped
          </p>
          <h2
            className="gs-vs-title"
            style={{
              margin: "16px 0 0",
              fontFamily: "var(--font-display-stack)",
              fontWeight: 400,
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.022em",
              color: INK,
              textWrap: "balance" as "balance",
            }}
          >
            Built for{" "}
            <em style={{ color: PERSIMMON, fontStyle: "italic" }}>your</em>{" "}
            timetable, not theirs.
          </h2>
          <p
            style={{
              margin: "18px 0 0",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 17,
              lineHeight: 1.55,
              color: INK_SOFT,
              maxWidth: 580,
            }}
          >
            Five honest differences between hiring a traditional visa
            consultant and using GetStamped. No outcome claims — just how
            each one actually works.
          </p>
        </header>

        {/* Comparison table */}
        <div
          className="gs-vs-grid"
          role="table"
          aria-label="Comparison: traditional consultant vs. GetStamped"
          style={{
            border: `1px solid ${STONE}`,
            borderRadius: 18,
            overflow: "hidden",
            background: "#FFFDF7",
            boxShadow: "0 24px 60px -32px rgba(11,30,63,0.18)",
          }}
        >
          {/* Column headers */}
          <div className="gs-vs-row gs-vs-row--head" role="row">
            <span className="gs-vs-cell gs-vs-cell--axis" role="columnheader">
              &nbsp;
            </span>
            <span
              className="gs-vs-cell gs-vs-cell--consult gs-vs-cell--head"
              role="columnheader"
            >
              Traditional consultant
            </span>
            <span
              className="gs-vs-cell gs-vs-cell--us gs-vs-cell--head"
              role="columnheader"
            >
              GetStamped
              <span aria-hidden className="gs-vs-head-tag">
                You
              </span>
            </span>
          </div>

          {ROWS.map((r, i) => (
            <RowComparison key={r.axis} row={r} index={i} />
          ))}
        </div>

        {/* Closer line — quiet, no overclaiming */}
        <p
          className="gs-vs-closer"
          style={{
            margin: "clamp(32px, 4vw, 48px) 0 0",
            fontFamily: "var(--font-display-stack)",
            fontSize: "clamp(20px, 2.6vw, 30px)",
            fontStyle: "italic",
            lineHeight: 1.35,
            color: INK_SOFT,
            maxWidth: 720,
          }}
        >
          The same kind of preparation a consultant offers — without the
          calendar tetris, available the moment you sit down.
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

        /* Grid layout */
        .gs-vs-row {
          display: grid;
          grid-template-columns: 200px 1fr 1.05fr;
          align-items: center;
          gap: clamp(16px, 2.4vw, 32px);
          padding: 18px clamp(18px, 2.4vw, 28px);
          border-bottom: 1px solid ${STONE};
        }
        .gs-vs-row:last-child { border-bottom: none; }

        .gs-vs-row--head {
          padding-top: 14px;
          padding-bottom: 14px;
          background: rgba(232,98,42,0.04);
          border-bottom-color: rgba(232,98,42,0.18);
        }
        .gs-vs-cell--head {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          font-weight: 600;
          color: ${INK};
        }
        .gs-vs-cell--head.gs-vs-cell--consult { color: ${INK_SOFT}; }
        .gs-vs-cell--head.gs-vs-cell--us {
          color: ${PERSIMMON_DEEP};
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .gs-vs-head-tag {
          font-size: 9px;
          padding: 3px 8px;
          border-radius: 999px;
          background: ${PERSIMMON};
          color: #FFFDF7;
          letter-spacing: 0.12em;
        }

        /* Row reveal */
        .gs-vs-row--body {
          opacity: 0;
          transform: translateY(8px);
        }
        .gs-vs.is-playing .gs-vs-row--body {
          animation: gs-vs-up 520ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
        ${[0, 1, 2, 3, 4]
          .map(
            (i) =>
              `.gs-vs.is-playing .gs-vs-row--body[data-i="${i}"] { animation-delay: ${
                160 + i * 110
              }ms; }`,
          )
          .join("\n")}

        .gs-vs-cell--axis {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-weight: 600;
          color: ${PERSIMMON_DEEP};
          line-height: 1.4;
        }
        .gs-vs-cell--consult {
          font-family: var(--font-sans-stack);
          font-size: 15px;
          line-height: 1.55;
          color: ${INK_SOFT};
        }
        .gs-vs-cell--us {
          font-family: var(--font-sans-stack);
          font-size: 16px;
          line-height: 1.55;
          color: ${INK};
          font-weight: 500;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .gs-vs-mark {
          flex: 0 0 auto;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: ${PERSIMMON};
          color: #FFFDF7;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          transform: scale(0);
          opacity: 0;
        }
        .gs-vs.is-playing .gs-vs-mark {
          animation: gs-vs-pop 420ms cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        ${[0, 1, 2, 3, 4]
          .map(
            (i) =>
              `.gs-vs.is-playing .gs-vs-row--body[data-i="${i}"] .gs-vs-mark {
                  animation-delay: ${380 + i * 110}ms;
                }`,
          )
          .join("\n")}
        @keyframes gs-vs-pop {
          to { opacity: 1; transform: scale(1); }
        }

        /* Persimmon underline drawing in under the emphasis word(s) */
        .gs-vs-em {
          position: relative;
          display: inline;
          color: ${INK};
          font-weight: 500;
          padding-bottom: 1px;
          background-image: linear-gradient(${PERSIMMON}, ${PERSIMMON});
          background-repeat: no-repeat;
          background-position: 0 100%;
          background-size: 0% 2px;
        }
        .gs-vs.is-playing .gs-vs-em {
          animation: gs-vs-underline 720ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
        ${[0, 1, 2, 3, 4]
          .map(
            (i) =>
              `.gs-vs.is-playing .gs-vs-row--body[data-i="${i}"] .gs-vs-em {
                  animation-delay: ${440 + i * 110}ms;
                }`,
          )
          .join("\n")}
        @keyframes gs-vs-underline {
          to { background-size: 100% 2px; }
        }

        /* Closer fade-up */
        .gs-vs-closer {
          opacity: 0;
          transform: translateY(8px);
          animation: gs-vs-up 700ms cubic-bezier(0.22,1,0.36,1) 1200ms both;
          animation-play-state: paused;
        }
        .gs-vs.is-playing .gs-vs-closer { animation-play-state: running; }

        /* Responsive — stack the comparison vertically on narrow screens */
        @media (max-width: 720px) {
          .gs-vs-row {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 18px 18px;
          }
          .gs-vs-row--head {
            display: none;
          }
          .gs-vs-cell--axis {
            font-size: 10px;
          }
          .gs-vs-cell--consult,
          .gs-vs-cell--us {
            font-size: 14.5px;
          }
          .gs-vs-cell--consult::before {
            content: "Consultant — ";
            font-family: var(--font-mono-stack, var(--font-sans-stack));
            font-size: 9px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: ${INK_SOFT};
            margin-right: 4px;
            opacity: 0.7;
          }
          .gs-vs-cell--us::before {
            content: "";
          }
          .gs-vs-cell--us {
            background: rgba(232,98,42,0.06);
            border-radius: 10px;
            padding: 10px 12px;
            border: 1px solid rgba(232,98,42,0.18);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gs-vs * { animation: none !important; transition: none !important; }
          .gs-vs-title, .gs-vs-row--body, .gs-vs-closer {
            opacity: 1 !important;
            transform: none !important;
          }
          .gs-vs-mark { opacity: 1 !important; transform: scale(1) !important; }
          .gs-vs-em { background-size: 100% 2px !important; }
        }
      `}</style>
    </section>
  );
}

/* ────────────────────────────────────────────── row ── */

function RowComparison({ row, index }: { row: Row; index: number }) {
  const { axis, consultant, getstamped, emphasis } = row;

  // Split the getstamped sentence around the emphasis phrase so we can
  // wrap that span with the underline-draw animation.
  let pre = getstamped;
  let mid = "";
  let post = "";
  if (emphasis) {
    const idx = getstamped.indexOf(emphasis);
    if (idx >= 0) {
      pre = getstamped.slice(0, idx);
      mid = emphasis;
      post = getstamped.slice(idx + emphasis.length);
    }
  }

  return (
    <div className="gs-vs-row gs-vs-row--body" data-i={index} role="row">
      <span className="gs-vs-cell gs-vs-cell--axis" role="cell">
        {axis}
      </span>
      <span className="gs-vs-cell gs-vs-cell--consult" role="cell">
        {consultant}
      </span>
      <span className="gs-vs-cell gs-vs-cell--us" role="cell">
        <span aria-hidden className="gs-vs-mark">
          <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
            <path
              d="M2.5 6.2 L5 8.6 L9.5 3.6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>
          {pre}
          {mid ? <span className="gs-vs-em">{mid}</span> : null}
          {post}
        </span>
      </span>
    </div>
  );
}
