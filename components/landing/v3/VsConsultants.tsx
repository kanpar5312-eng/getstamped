"use client";

import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   VsConsultants — fighting-game style face-off between "THE CONSULTANT"
   and "GETSTAMPED". Sits between StackedFeatureCards and Pricing.

   Behaviour:
     • Pure additive. No layout / functionality / pricing changes
       elsewhere on the site.
     • Animation is paused until the section scrolls into view; an
       IntersectionObserver flips a `.is-playing` class on the root,
       which unlocks every keyframe (animation-play-state: paused → running).
       Fires once — the rematch only runs when the user first sees it.
     • Honours prefers-reduced-motion (all motion off, end-state frozen).
     • Stays on brand: warm cream + ink + persimmon only. No neon,
       no purple. Game energy via composition + timing, not colour.
     • No pricing mentioned anywhere.
   ═════════════════════════════════════════════════════════════════════════ */

const PERSIMMON = "#E8622A";
const PERSIMMON_DEEP = "#B85A15";
const INK = "#0B1E3F";
const INK_SOFT = "#2A3F5F";
const CREAM = "#F5F1E8";
const PEACH = "#FBE8D9";
const GREEN = "#3FB37F";

type Round = {
  axis: string;
  consultant: string;
  getstamped: string;
};

const ROUNDS: Round[] = [
  {
    axis: "AVAILABILITY",
    consultant: "Office hours, by appointment",
    getstamped: "24/7, in your pocket",
  },
  {
    axis: "DOCUMENTS",
    consultant: "Reviewed in meetings",
    getstamped: "AI checks every page in seconds",
  },
  {
    axis: "MOCK INTERVIEWS",
    consultant: "1–2 sessions, in person",
    getstamped: "Unlimited voice mocks",
  },
  {
    axis: "PACE",
    consultant: "Their schedule",
    getstamped: "Yours",
  },
  {
    axis: "DEPTH",
    consultant: "Verbal summary you'll forget",
    getstamped: "A 47-step playbook you keep",
  },
  {
    axis: "WHERE ANSWERS LIVE",
    consultant: "In their head",
    getstamped: "In your hand",
  },
];

export function VsConsultants() {
  const rootRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // If the user prefers reduced motion, render everything in its
    // final state immediately — no observer dance needed.
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
          if (e.isIntersecting && e.intersectionRatio >= 0.28) {
            setPlaying(true);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: [0.28] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-label="GetStamped vs. consultants"
      className={`gs-vs ${playing ? "is-playing" : ""}`}
      style={{
        position: "relative",
        background: CREAM,
        padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
        overflow: "hidden",
      }}
    >
      {/* Persimmon corner glow — drifts in once playing */}
      <span aria-hidden className="gs-vs-glow gs-vs-glow-1" />
      <span aria-hidden className="gs-vs-glow gs-vs-glow-2" />

      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 11,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: PERSIMMON,
              fontWeight: 600,
              margin: 0,
            }}
          >
            Round 1 · Choose your fighter
          </p>
          <h2
            className="gs-vs-title"
            style={{
              fontFamily: "var(--font-display-stack)",
              fontWeight: 400,
              fontSize: "clamp(52px, 7.4vw, 112px)",
              lineHeight: 0.96,
              letterSpacing: "-0.03em",
              color: INK,
              margin: "18px 0 0",
              textWrap: "balance" as "balance",
            }}
          >
            The consultant{" "}
            <em
              style={{
                color: PERSIMMON,
                fontStyle: "italic",
              }}
            >
              vs. you,
            </em>{" "}
            armed.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 18,
              lineHeight: 1.55,
              color: INK_SOFT,
              margin: "20px auto 0",
              maxWidth: 580,
            }}
          >
            Two ways to prep for an F-1 visa. One was built for the
            consultant&rsquo;s calendar. The other was built for yours.
          </p>
        </div>

        {/* The arena */}
        <div
          className="gs-vs-arena"
          style={{
            position: "relative",
            marginTop: "clamp(56px, 7vw, 88px)",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "clamp(16px, 3vw, 36px)",
            alignItems: "center",
          }}
        >
          {/* LEFT CONTENDER — Consultant */}
          <Contender
            side="left"
            kicker="OG · Class A"
            name="The Consultant"
            tagline="Sees you when there&rsquo;s a slot."
            iconKind="briefcase"
            hpClass="gs-vs-hp-fill-consult"
            tone="ink"
          />

          {/* VS BADGE */}
          <div
            className="gs-vs-badge-wrap"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              minWidth: 92,
            }}
          >
            <span className="gs-vs-badge">
              VS
              <span className="gs-vs-badge-ring" aria-hidden />
            </span>
            <span className="gs-vs-fight" aria-hidden>
              FIGHT
            </span>
          </div>

          {/* RIGHT CONTENDER — GetStamped */}
          <Contender
            side="right"
            kicker="2026 · Challenger"
            name="GetStamped"
            tagline="Always on. Always with you."
            iconKind="stamp"
            hpClass="gs-vs-hp-fill-us"
            tone="persimmon"
          />
        </div>

        {/* ROUNDS — staggered comparison rows */}
        <div
          className="gs-vs-rounds"
          style={{
            marginTop: "clamp(48px, 6vw, 80px)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxWidth: 980,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {ROUNDS.map((r, i) => (
            <RoundRow key={r.axis} round={r} index={i} />
          ))}
        </div>

        {/* WINNER stamp */}
        <div
          className="gs-vs-winner-wrap"
          style={{
            position: "relative",
            marginTop: "clamp(48px, 6vw, 72px)",
            textAlign: "center",
          }}
        >
          <span className="gs-vs-winner">
            <span className="gs-vs-winner-inner">
              <span
                style={{
                  fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                  fontSize: 11,
                  letterSpacing: "0.36em",
                  display: "block",
                  opacity: 0.7,
                }}
              >
                K.O.
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display-stack)",
                  fontSize: 36,
                  letterSpacing: "0.06em",
                  display: "block",
                  marginTop: 4,
                }}
              >
                YOU WIN
              </span>
            </span>
          </span>
          <p
            className="gs-vs-winner-sub"
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 14,
              color: INK_SOFT,
              margin: "22px auto 0",
              maxWidth: 460,
            }}
          >
            The same prep a consultant gives you — minus the calendar
            tetris, minus the lecture, plus your own pace.
          </p>
        </div>
      </div>

      {/* Styles + keyframes */}
      <style>{`
        /* ──────────────────────────────────────────────────────────────
           All animations are paused by default. The IntersectionObserver
           adds .is-playing to the section root once it scrolls into view,
           which lifts the pause and the whole sequence runs once.
           ────────────────────────────────────────────────────────────── */
        .gs-vs *[data-anim] {
          animation-play-state: paused;
          animation-fill-mode: both;
        }
        .gs-vs.is-playing *[data-anim] {
          animation-play-state: running;
        }

        /* Persimmon corner glows */
        .gs-vs-glow {
          position: absolute;
          width: 560px; height: 560px; border-radius: 999px;
          background: radial-gradient(closest-side, rgba(232,98,42,0.22), transparent 70%);
          filter: blur(20px);
          pointer-events: none;
          opacity: 0;
        }
        .gs-vs-glow-1 { top: -180px; left: -160px; }
        .gs-vs-glow-2 { bottom: -200px; right: -200px; }
        .gs-vs.is-playing .gs-vs-glow {
          animation: gs-vs-glow-in 1.6s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .gs-vs.is-playing .gs-vs-glow-2 { animation-delay: 320ms; }
        @keyframes gs-vs-glow-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Title — letters drift up in unison after a tiny anticipation. */
        .gs-vs-title {
          opacity: 0;
          transform: translateY(18px);
          animation: gs-vs-title-in 720ms cubic-bezier(0.22,1,0.36,1) both;
          animation-play-state: paused;
        }
        .gs-vs.is-playing .gs-vs-title { animation-play-state: running; }
        @keyframes gs-vs-title-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── ARENA contenders slide in from outside ─────────────────── */
        .gs-vs-contender {
          position: relative;
          padding: clamp(20px, 2vw, 28px);
          border-radius: 18px;
          border: 1px solid rgba(11,30,63,0.10);
          background: #FFFDF7;
          box-shadow: 0 20px 50px -28px rgba(11,30,63,0.32);
          opacity: 0;
        }
        .gs-vs-contender[data-side="left"]  { transform: translateX(-40px); }
        .gs-vs-contender[data-side="right"] { transform: translateX(40px); }
        .gs-vs.is-playing .gs-vs-contender[data-side="left"] {
          animation: gs-vs-slide-l 760ms cubic-bezier(0.22,1,0.36,1) 240ms forwards;
        }
        .gs-vs.is-playing .gs-vs-contender[data-side="right"] {
          animation: gs-vs-slide-r 760ms cubic-bezier(0.22,1,0.36,1) 420ms forwards;
        }
        @keyframes gs-vs-slide-l {
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes gs-vs-slide-r {
          to { opacity: 1; transform: translateX(0); }
        }

        .gs-vs-contender--persimmon {
          background: ${PEACH};
          border-color: rgba(232,98,42,0.35);
          box-shadow: 0 24px 56px -28px rgba(232,98,42,0.45),
                      0 0 0 1px rgba(232,98,42,0.25);
        }

        /* "HP" bar that fills after the contender lands. */
        .gs-vs-hp {
          position: relative;
          height: 8px;
          border-radius: 999px;
          background: rgba(11,30,63,0.10);
          overflow: hidden;
          margin-top: 16px;
        }
        .gs-vs-hp-bar {
          position: absolute; inset: 0;
          border-radius: 999px;
          transform-origin: left center;
          transform: scaleX(0);
        }
        .gs-vs-hp-fill-consult {
          background: linear-gradient(90deg, ${INK_SOFT}, ${INK});
        }
        .gs-vs-hp-fill-us {
          background: linear-gradient(90deg, ${PERSIMMON}, ${PERSIMMON_DEEP});
          box-shadow: 0 0 12px rgba(232,98,42,0.55);
        }
        .gs-vs.is-playing .gs-vs-hp-fill-consult {
          animation: gs-vs-hp-consult 900ms cubic-bezier(0.22,1,0.36,1) 1100ms forwards;
        }
        .gs-vs.is-playing .gs-vs-hp-fill-us {
          animation: gs-vs-hp-us 1100ms cubic-bezier(0.22,1,0.36,1) 1200ms forwards;
        }
        @keyframes gs-vs-hp-consult {
          to { transform: scaleX(0.42); }
        }
        @keyframes gs-vs-hp-us {
          to { transform: scaleX(1); }
        }

        /* ── VS BADGE smash-in ──────────────────────────────────────── */
        .gs-vs-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 84px; height: 84px;
          border-radius: 999px;
          background: ${PERSIMMON};
          color: #FFF;
          font-family: var(--font-display-stack);
          font-weight: 400;
          font-size: 30px;
          letter-spacing: 0.04em;
          box-shadow:
            0 14px 30px -10px rgba(232,98,42,0.7),
            inset 0 -3px 0 rgba(0,0,0,0.18),
            inset 0 2px 0 rgba(255,255,255,0.25);
          transform: scale(0) rotate(-25deg);
          opacity: 0;
        }
        .gs-vs.is-playing .gs-vs-badge {
          animation: gs-vs-badge-smash 700ms cubic-bezier(0.34,1.56,0.64,1) 680ms forwards;
        }
        @keyframes gs-vs-badge-smash {
          0%   { transform: scale(0) rotate(-25deg); opacity: 0; }
          60%  { transform: scale(1.18) rotate(6deg);  opacity: 1; }
          78%  { transform: scale(0.94) rotate(-3deg); }
          100% { transform: scale(1)    rotate(0);     opacity: 1; }
        }
        .gs-vs-badge-ring {
          position: absolute; inset: -10px;
          border-radius: 999px;
          border: 2px solid ${PERSIMMON};
          opacity: 0;
        }
        .gs-vs.is-playing .gs-vs-badge-ring {
          animation: gs-vs-badge-pulse 1.8s ease-out 1380ms infinite;
        }
        @keyframes gs-vs-badge-pulse {
          0%   { opacity: 0.7; transform: scale(0.85); }
          100% { opacity: 0;   transform: scale(1.5); }
        }
        .gs-vs-fight {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.4em;
          color: ${PERSIMMON_DEEP};
          font-weight: 700;
          opacity: 0;
        }
        .gs-vs.is-playing .gs-vs-fight {
          animation: gs-vs-fight-in 0.9s steps(2, end) 1500ms forwards;
        }
        @keyframes gs-vs-fight-in {
          0%, 30%   { opacity: 0; }
          50%, 70%  { opacity: 1; }
          85%       { opacity: 0; }
          100%      { opacity: 1; }
        }

        /* ── ROUND ROWS ─────────────────────────────────────────────── */
        .gs-vs-round {
          display: grid;
          grid-template-columns: 110px 1fr 24px 1fr;
          align-items: center;
          gap: clamp(10px, 1.6vw, 22px);
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid rgba(11,30,63,0.08);
          background: rgba(255, 253, 247, 0.7);
          opacity: 0;
          transform: translateY(10px);
        }
        .gs-vs.is-playing .gs-vs-round {
          animation: gs-vs-round-in 460ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes gs-vs-round-in {
          to { opacity: 1; transform: translateY(0); }
        }
        .gs-vs-axis {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.22em;
          font-weight: 600;
          color: ${PERSIMMON_DEEP};
        }
        .gs-vs-cell {
          font-family: var(--font-sans-stack);
          font-size: 15px;
          line-height: 1.4;
          color: ${INK};
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .gs-vs-cell--consult { color: ${INK_SOFT}; opacity: 0.78; }
        .gs-vs-vs-mini {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          color: rgba(11,30,63,0.35);
          letter-spacing: 0.2em;
          text-align: center;
        }

        /* Per-row hit markers that pop in after the row lands. */
        .gs-vs-mark {
          width: 18px; height: 18px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          opacity: 0;
          transform: scale(0.5);
        }
        .gs-vs-mark--miss { background: rgba(11,30,63,0.10); color: rgba(11,30,63,0.55); }
        .gs-vs-mark--hit  { background: ${GREEN}; color: #FFFFFF; }
        .gs-vs.is-playing .gs-vs-mark {
          animation: gs-vs-mark-pop 380ms cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes gs-vs-mark-pop {
          to { opacity: 1; transform: scale(1); }
        }

        /* Stagger every round row + its marks based on its data-index. */
        ${[0, 1, 2, 3, 4, 5]
          .map((i) => {
            const rowDelay = 1700 + i * 220;
            const markDelay = rowDelay + 250;
            return `
              .gs-vs.is-playing .gs-vs-round[data-i="${i}"] {
                animation-delay: ${rowDelay}ms;
              }
              .gs-vs.is-playing .gs-vs-round[data-i="${i}"] .gs-vs-mark {
                animation-delay: ${markDelay}ms;
              }
            `;
          })
          .join("\n")}

        /* ── WINNER stamp ───────────────────────────────────────────── */
        .gs-vs-winner {
          position: relative;
          display: inline-block;
          padding: 18px 38px;
          border-radius: 14px;
          background: ${PERSIMMON};
          color: #FFFDF7;
          box-shadow:
            0 22px 50px -18px rgba(232,98,42,0.55),
            inset 0 -3px 0 rgba(0,0,0,0.18),
            inset 0 2px 0 rgba(255,255,255,0.22);
          transform: scale(0.4) rotate(-12deg);
          opacity: 0;
        }
        .gs-vs.is-playing .gs-vs-winner {
          animation: gs-vs-winner-drop 720ms cubic-bezier(0.34,1.56,0.64,1) 3500ms forwards;
        }
        @keyframes gs-vs-winner-drop {
          0%   { transform: scale(0.4) rotate(-12deg); opacity: 0; }
          55%  { transform: scale(1.15) rotate(4deg);  opacity: 1; }
          78%  { transform: scale(0.96) rotate(-2deg); }
          100% { transform: scale(1)    rotate(-3deg); opacity: 1; }
        }
        .gs-vs-winner-inner { display: block; line-height: 1; }
        .gs-vs-winner-sub {
          opacity: 0;
          animation: gs-vs-fade-in 600ms ease-out 4100ms forwards;
          animation-play-state: paused;
        }
        .gs-vs.is-playing .gs-vs-winner-sub { animation-play-state: running; }
        @keyframes gs-vs-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive — stack arena to one column on mobile ──────── */
        @media (max-width: 760px) {
          .gs-vs-arena {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .gs-vs-badge-wrap { flex-direction: row !important; gap: 16px !important; }
          .gs-vs-round {
            grid-template-columns: 100px 1fr;
            grid-template-areas:
              "axis cell-r"
              "cell-l cell-l";
            row-gap: 8px;
          }
          .gs-vs-round .gs-vs-axis      { grid-area: axis; }
          .gs-vs-round .gs-vs-cell--us  { grid-area: cell-r; justify-content: flex-end; }
          .gs-vs-round .gs-vs-cell--consult { grid-area: cell-l; }
          .gs-vs-round .gs-vs-vs-mini   { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gs-vs *,
          .gs-vs *::before,
          .gs-vs *::after { animation: none !important; transition: none !important; }
          .gs-vs-title, .gs-vs-contender, .gs-vs-round,
          .gs-vs-winner, .gs-vs-winner-sub, .gs-vs-fight {
            opacity: 1 !important;
            transform: none !important;
          }
          .gs-vs-glow { opacity: 1 !important; }
          .gs-vs-hp-fill-consult { transform: scaleX(0.42) !important; }
          .gs-vs-hp-fill-us      { transform: scaleX(1) !important; }
          .gs-vs-mark            { opacity: 1 !important; transform: scale(1) !important; }
        }
      `}</style>
    </section>
  );
}

/* ────────────────────────────────────────────── contender ── */

function Contender({
  side,
  kicker,
  name,
  tagline,
  iconKind,
  hpClass,
  tone,
}: {
  side: "left" | "right";
  kicker: string;
  name: string;
  tagline: string;
  iconKind: "briefcase" | "stamp";
  hpClass: string;
  tone: "ink" | "persimmon";
}) {
  return (
    <article
      className={`gs-vs-contender${tone === "persimmon" ? " gs-vs-contender--persimmon" : ""}`}
      data-side={side}
      data-anim="true"
      style={{ textAlign: side === "left" ? "left" : "right" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: side === "left" ? "flex-start" : "flex-end",
        }}
      >
        {side === "left" ? <Icon kind={iconKind} tone={tone} /> : null}
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: tone === "persimmon" ? PERSIMMON_DEEP : INK_SOFT,
              opacity: 0.85,
            }}
          >
            {kicker}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "var(--font-display-stack)",
              fontSize: 28,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: INK,
            }}
          >
            {name}
          </p>
        </div>
        {side === "right" ? <Icon kind={iconKind} tone={tone} /> : null}
      </div>

      <p
        style={{
          margin: "12px 0 0",
          fontFamily: "var(--font-sans-stack)",
          fontSize: 14,
          lineHeight: 1.5,
          color: INK_SOFT,
        }}
      >
        {tagline}
      </p>

      <div className="gs-vs-hp" aria-hidden>
        <span className={`gs-vs-hp-bar ${hpClass}`} />
      </div>
      <div
        style={{
          marginTop: 6,
          display: "flex",
          justifyContent: side === "left" ? "flex-start" : "flex-end",
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 9,
          letterSpacing: "0.22em",
          color: "rgba(11,30,63,0.45)",
        }}
      >
        HP
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────── icons ── */

function Icon({ kind, tone }: { kind: "briefcase" | "stamp"; tone: "ink" | "persimmon" }) {
  const fg = tone === "persimmon" ? PERSIMMON : INK;
  const bg = tone === "persimmon" ? "rgba(232,98,42,0.18)" : "rgba(11,30,63,0.08)";
  return (
    <span
      aria-hidden
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: bg,
        color: fg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
      }}
    >
      {kind === "briefcase" ? (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 13h18" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 21h14" />
          <path d="M12 17V9" />
          <path d="M9 9h6l-1-4h-4l-1 4z" />
          <path d="M7 17h10v-2H7z" />
        </svg>
      )}
    </span>
  );
}

/* ────────────────────────────────────────────── round row ── */

function RoundRow({ round, index }: { round: Round; index: number }) {
  return (
    <div className="gs-vs-round" data-i={index} data-anim="true">
      <span className="gs-vs-axis">{round.axis}</span>
      <span className="gs-vs-cell gs-vs-cell--consult">
        <span className="gs-vs-mark gs-vs-mark--miss" aria-hidden>
          <svg viewBox="0 0 12 12" width="9" height="9" fill="none">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        {round.consultant}
      </span>
      <span className="gs-vs-vs-mini" aria-hidden>
        VS
      </span>
      <span className="gs-vs-cell gs-vs-cell--us">
        <span className="gs-vs-mark gs-vs-mark--hit" aria-hidden>
          <svg viewBox="0 0 12 12" width="9" height="9" fill="none">
            <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {round.getstamped}
      </span>
    </div>
  );
}
