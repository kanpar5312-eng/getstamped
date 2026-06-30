"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ════════════════════════════════════════════════════════════════════════
   VsConsultants — 22-second fighting-game cutscene that auto-plays once
   when it scrolls into view. Sits between StackedFeatureCards and
   Pricing. Additive only — nothing else on the site is touched.

   ──────────────────────────────────────────────────────────────────────
   Timeline (each beat is a sound cue for later)
   ──────────────────────────────────────────────────────────────────────
   0.0s   Arena fades up — peach/cream warm stage, persimmon spotlights
   1.0s   Title smashes in: "FINAL ROUND · F-1 VISA"
   2.6s   VS-CHALLENGER splash: two character portraits slam in from
          the sides, big VS smashes between them, "CHALLENGER /
          REIGNING CHAMP" banners flicker
   5.6s   Splash dissolves, fighters take combat positions
   6.0s   "FIGHT!" smash
   6.2s   HUD descends, HP bars fill
   6.8s   POWER-UP 1 (PLAYBOOK) drops → beam → screen shake → HP -25
   8.8s   POWER-UP 2 (VAULT)    drops → beam → shake → HP -25
  10.8s   POWER-UP 3 (MOCK)     drops → beam → shake → HP -25
  12.8s   POWER-UP 4 (PARENT)   drops → beam → shake → HP 0
  14.8s   "K.O.!" — consultant flickers and slides off
  16.2s   Victory pose + "STAMPED!" + 14-particle burst
  17.8s   Outro headline: "Your visa. On your timetable."
  20.0s   Replay button visible
  22.0s   Scene holds

   Brand discipline: cream + peach + ink + persimmon only. No neon, no
   purple, no blue. The arcade aesthetic comes from composition +
   timing, never from palette deviations.

   Honours prefers-reduced-motion (skips the whole cutscene, freezes
   the end state — winner pose + outro headline still visible).
   ═════════════════════════════════════════════════════════════════════════ */

const PERSIMMON = "#E8622A";
const PERSIMMON_DEEP = "#B85A15";
const INK = "#0B1E3F";
const INK_SOFT = "#2A3F5F";
const PAPER = "#FAF8F4";
const CREAM = "#F5F1E8";
const PEACH = "#FBE8D9";
void CREAM;
void PEACH;
void PAPER;

export function VsConsultants() {
  const rootRef = useRef<HTMLElement>(null);
  const [playKey, setPlayKey] = useState(0);
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
          if (e.isIntersecting && e.intersectionRatio >= 0.32) {
            setPlaying(true);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: [0.32] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const replay = () => {
    setPlaying(false);
    setPlayKey((k) => k + 1);
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)));
  };

  return (
    <section
      ref={rootRef}
      aria-label="GetStamped vs. consultants — cutscene"
      style={{
        position: "relative",
        // Soothing warm-cream section bg so the arcade cabinet sits on
        // the same tone as the rest of the landing — no more cold ink
        // wall around it. The cabinet itself stays dark for contrast.
        background: "#F5F1E8",
        padding: "clamp(64px, 8vw, 112px) clamp(16px, 4vw, 48px)",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <span aria-hidden className="gs-vc-halo gs-vc-halo-l" />
      <span aria-hidden className="gs-vc-halo gs-vc-halo-r" />

      <header
        style={{
          textAlign: "center",
          maxWidth: 760,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 11,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: PERSIMMON,
            fontWeight: 600,
          }}
        >
          Boss-fight mode
        </p>
        <h2
          style={{
            margin: "16px 0 0",
            fontFamily: "var(--font-display-stack)",
            fontWeight: 400,
            fontSize: "clamp(40px, 6vw, 84px)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            color: INK,
            textWrap: "balance" as "balance",
          }}
        >
          The consultant{" "}
          <em style={{ color: PERSIMMON, fontStyle: "italic" }}>vs. you,</em>{" "}
          armed.
        </h2>
        <p
          style={{
            margin: "18px auto 0",
            maxWidth: 540,
            fontFamily: "var(--font-sans-stack)",
            fontSize: 16,
            lineHeight: 1.55,
            color: INK_SOFT,
          }}
        >
          Press play. Twenty-plus seconds, four power-ups, one finish.
        </p>
      </header>

      <div
        className="gs-vc-frame"
        style={{
          position: "relative",
          maxWidth: 1100,
          margin: "clamp(36px, 5vw, 56px) auto 0",
          borderRadius: 22,
          padding: 14,
          background: "linear-gradient(180deg, #2a1810 0%, #160a05 100%)",
          border: "1px solid rgba(232,98,42,0.25)",
          boxShadow:
            "0 50px 100px -40px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,98,42,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px 10px",
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 10,
            letterSpacing: "0.28em",
            color: "rgba(250,248,244,0.55)",
          }}
        >
          <span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: PERSIMMON,
                display: "inline-block",
                marginRight: 8,
                verticalAlign: "middle",
                boxShadow: "0 0 8px rgba(232,98,42,0.8)",
                animation: "gs-vc-rec 1.4s ease-in-out infinite",
              }}
            />
            REC · CABINET 47
          </span>
          <span>GS-ARCADE / F-1</span>
        </div>

        <Stage key={playKey} playing={playing} />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "16px 0 4px",
          }}
        >
          <button
            type="button"
            onClick={replay}
            className="gs-vc-replay"
            aria-label="Rematch"
          >
            <span aria-hidden style={{ marginRight: 8 }}>▶</span>
            Rematch
          </button>
        </div>
      </div>

      <style>{`
        @keyframes gs-vc-rec {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }
        .gs-vc-halo {
          position: absolute;
          width: 720px; height: 720px;
          border-radius: 999px;
          background: radial-gradient(closest-side, rgba(232,98,42,0.30), transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.55;
          animation: gs-vc-halo-pulse 8s ease-in-out infinite;
        }
        .gs-vc-halo-l { top: -260px; left: -200px; }
        .gs-vc-halo-r { bottom: -260px; right: -200px; animation-delay: -4s; }
        @keyframes gs-vc-halo-pulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50%      { opacity: 0.7;  transform: scale(1.06); }
        }
        .gs-vc-replay {
          display: inline-flex;
          align-items: center;
          padding: 10px 22px;
          border-radius: 999px;
          background: ${PERSIMMON};
          color: #FFFDF7;
          border: none;
          font-family: var(--font-sans-stack);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 12px 28px -10px rgba(232,98,42,0.7),
                      inset 0 -2px 0 rgba(0,0,0,0.18);
          transition: transform 160ms ease-out, background 160ms ease-out;
        }
        .gs-vc-replay:hover { background: #F07040; transform: translateY(-1px); }
        .gs-vc-replay:active { transform: translateY(0) scale(0.98); }

        @media (max-width: 640px) {
          .gs-vc-halo { width: 480px; height: 480px; }
        }
      `}</style>
    </section>
  );
}

/* ────────────────────────────────────────────── stage ── */

function Stage({ playing }: { playing: boolean }) {
  return (
    <div
      className={`gs-vc-stage ${playing ? "is-playing" : ""}`}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        borderRadius: 14,
        overflow: "hidden",
        // WARM stage — peach/cream radial, not blue. Persimmon glow at center.
        background:
          "radial-gradient(ellipse at center 65%, #FBE8D9 0%, #F5E5CC 55%, #E8D0B0 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(232,98,42,0.18), inset 0 -40px 60px -30px rgba(184,90,21,0.35)",
      }}
    >
      <div className="gs-vc-floor" aria-hidden>
        <div className="gs-vc-floor-grid" />
        <div className="gs-vc-floor-fade" />
      </div>

      <span aria-hidden className="gs-vc-spot gs-vc-spot-l" />
      <span aria-hidden className="gs-vc-spot gs-vc-spot-r" />

      {/* HUD */}
      <div className="gs-vc-hud" aria-hidden>
        <div className="gs-vc-hp-block gs-vc-hp-block-l">
          <span className="gs-vc-hp-name">THE CONSULTANT</span>
          <div className="gs-vc-hp">
            <span className="gs-vc-hp-bar gs-vc-hp-consult" />
          </div>
        </div>
        <div className="gs-vc-round-indicator">
          <span className="gs-vc-round-num">R1</span>
          <span className="gs-vc-round-label">FINAL ROUND</span>
        </div>
        <div className="gs-vc-hp-block gs-vc-hp-block-r">
          <span className="gs-vc-hp-name">YOU</span>
          <div className="gs-vc-hp">
            <span className="gs-vc-hp-bar gs-vc-hp-you" />
          </div>
        </div>
      </div>

      {/* VS Challenger splash — runs first, then dissolves */}
      <VsSplash />

      {/* Fighters — characters, not discs */}
      <Fighter side="left" name="THE CONSULTANT" sub="Office hours · Class A" kind="consultant" />
      <Fighter side="right" name="YOU" sub="+ GetStamped" kind="student" />

      {/* Power-ups */}
      <PowerUp abbr="P" label="PLAYBOOK"     cls="gs-vc-pu-1" beamCls="gs-vc-beam-1" />
      <PowerUp abbr="V" label="VAULT"        cls="gs-vc-pu-2" beamCls="gs-vc-beam-2" />
      <PowerUp abbr="M" label="MOCK"         cls="gs-vc-pu-3" beamCls="gs-vc-beam-3" />
      <PowerUp abbr="S" label="PARENT"       cls="gs-vc-pu-4" beamCls="gs-vc-beam-4" />

      {/* Announcer smash text */}
      <SmashText cls="gs-vc-final">FINAL ROUND</SmashText>
      <SmashText cls="gs-vc-fight">FIGHT!</SmashText>
      <SmashText cls="gs-vc-ko">K.O.!</SmashText>
      <SmashText cls="gs-vc-stamped">STAMPED!</SmashText>

      {/* Particle burst */}
      <div className="gs-vc-particles" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className={`gs-vc-particle gs-vc-particle-${i}`} />
        ))}
      </div>

      {/* Outro headline */}
      <div className="gs-vc-outro" aria-hidden>
        <p className="gs-vc-outro-line">Your visa.</p>
        <p className="gs-vc-outro-line gs-vc-outro-em">
          <em>On your timetable.</em>
        </p>
      </div>

      <style>{`
        /* All cutscene animations paused until .is-playing is added. */
        .gs-vc-stage *[data-anim] {
          animation-play-state: paused;
          animation-fill-mode: both;
        }
        .gs-vc-stage.is-playing *[data-anim] {
          animation-play-state: running;
        }

        /* Perspective grid floor — persimmon lines on cream */
        .gs-vc-floor {
          position: absolute; inset: 0;
          perspective: 600px;
          perspective-origin: 50% 0%;
          pointer-events: none;
          opacity: 0;
        }
        .gs-vc-stage.is-playing .gs-vc-floor {
          animation: gs-vc-fade-in 1s ease-out 0.2s forwards;
        }
        .gs-vc-floor-grid {
          position: absolute;
          left: -10%; right: -10%;
          top: 58%;
          height: 80%;
          transform-origin: 50% 0%;
          transform: rotateX(70deg);
          background-image:
            linear-gradient(rgba(184,90,21,0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,90,21,0.30) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%);
          animation: gs-vc-grid-scroll 2.4s linear infinite;
        }
        @keyframes gs-vc-grid-scroll {
          from { background-position: 0 0,    0 0;    }
          to   { background-position: 0 40px, 0 0;    }
        }
        .gs-vc-floor-fade {
          position: absolute;
          left: 0; right: 0; top: 58%; bottom: 0;
          background: linear-gradient(180deg, transparent, rgba(184,90,21,0.18));
          pointer-events: none;
        }

        /* Spotlight cones — persimmon glow from the top */
        .gs-vc-spot {
          position: absolute;
          width: 360px; height: 80%;
          top: -8%;
          background: radial-gradient(ellipse at top, rgba(232,98,42,0.42), transparent 65%);
          mask-image: linear-gradient(180deg, #000 0%, transparent 80%);
          pointer-events: none;
          opacity: 0;
          mix-blend-mode: multiply;
        }
        .gs-vc-spot-l { left: 6%; }
        .gs-vc-spot-r { right: 6%; }
        .gs-vc-stage.is-playing .gs-vc-spot {
          animation: gs-vc-spot-flicker 5s ease-in-out 0.3s infinite;
        }
        @keyframes gs-vc-spot-flicker {
          0%, 100% { opacity: 0.7; }
          25%      { opacity: 0.4; }
          50%      { opacity: 0.9; }
          75%      { opacity: 0.55; }
        }

        /* HUD */
        .gs-vc-hud {
          position: absolute;
          top: 14px; left: 14px; right: 14px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 18px;
          align-items: center;
          z-index: 4;
          opacity: 0;
          transform: translateY(-8px);
        }
        .gs-vc-stage.is-playing .gs-vc-hud {
          animation: gs-vc-fade-down 600ms cubic-bezier(0.22,1,0.36,1) 6200ms forwards;
        }
        @keyframes gs-vc-fade-down {
          to { opacity: 1; transform: translateY(0); }
        }
        .gs-vc-hp-block { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        .gs-vc-hp-block-r { align-items: flex-end; }
        .gs-vc-hp-name {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.22em;
          color: ${INK};
          font-weight: 600;
        }
        .gs-vc-hp {
          height: 10px;
          width: 100%;
          background:
            repeating-linear-gradient(90deg, rgba(11,30,63,0.07) 0 6px, transparent 6px 7px),
            rgba(11,30,63,0.08);
          border: 1px solid rgba(11,30,63,0.25);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
          box-shadow: inset 0 1px 0 rgba(0,0,0,0.08);
        }
        .gs-vc-hp-bar {
          position: absolute; top: 0; bottom: 0; left: 0;
          width: 0%;
          background: linear-gradient(90deg, ${PERSIMMON}, ${PERSIMMON_DEEP});
          box-shadow: 0 0 12px rgba(232,98,42,0.7);
        }
        .gs-vc-stage.is-playing .gs-vc-hp-you {
          animation: gs-vc-hp-fill 800ms cubic-bezier(0.22,1,0.36,1) 6300ms forwards;
        }
        @keyframes gs-vc-hp-fill {
          to { width: 100%; }
        }
        /* Consultant HP drains in 4 staged hits at each power-up beat.
           Total animation: 8000ms starting at 6300ms. */
        .gs-vc-stage.is-playing .gs-vc-hp-consult {
          animation: gs-vc-hp-drain 9000ms steps(1, end) 6300ms forwards;
        }
        @keyframes gs-vc-hp-drain {
          0%     { width: 0%;   }
          6%     { width: 100%; }
          /* hit 1 at ~7.0s → t = 700/9000 ≈ 8% */
          12%    { width: 100%; }
          14%    { width: 75%;  }
          /* hit 2 at ~9.0s → t = 2700/9000 = 30% */
          30%    { width: 75%;  }
          32%    { width: 50%;  }
          /* hit 3 at ~11.0s → t = 4700/9000 = 52% */
          52%    { width: 50%;  }
          54%    { width: 25%;  }
          /* hit 4 at ~13.0s → t = 6700/9000 = 74% */
          74%    { width: 25%;  }
          76%    { width: 0%;   }
          100%   { width: 0%;   }
        }
        .gs-vc-round-indicator {
          display: flex; flex-direction: column; align-items: center;
          padding: 4px 10px;
          border: 1px solid rgba(232,98,42,0.55);
          border-radius: 6px;
          background: rgba(232,98,42,0.18);
        }
        .gs-vc-round-num {
          font-family: var(--font-display-stack);
          font-size: 16px;
          color: ${PERSIMMON_DEEP};
          letter-spacing: 0.04em;
          line-height: 1;
        }
        .gs-vc-round-label {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 8px;
          letter-spacing: 0.32em;
          color: ${INK};
          margin-top: 2px;
        }

        /* ── VS Splash card — slams in, holds, dissolves ─────────────── */
        .gs-vc-splash {
          position: absolute; inset: 0;
          z-index: 9;
          pointer-events: none;
          opacity: 0;
        }
        .gs-vc-stage.is-playing .gs-vc-splash {
          animation: gs-vc-splash-show 3.2s linear 2600ms both;
        }
        @keyframes gs-vc-splash-show {
          0%   { opacity: 0; }
          5%   { opacity: 1; }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }
        .gs-vc-splash-bg {
          position: absolute; inset: 0;
          background:
            linear-gradient(135deg, rgba(184,90,21,0.85) 0%, rgba(184,90,21,0) 35%),
            linear-gradient(225deg, rgba(11,30,63,0.85) 0%, rgba(11,30,63,0) 35%);
        }
        .gs-vc-splash-side {
          position: absolute;
          top: 0; bottom: 0;
          width: 45%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6%;
        }
        .gs-vc-splash-side-l { left: 0;  transform: translateX(-110%); }
        .gs-vc-splash-side-r { right: 0; transform: translateX(110%); }
        .gs-vc-stage.is-playing .gs-vc-splash-side-l {
          animation: gs-vc-splash-in-l 700ms cubic-bezier(0.34,1.56,0.64,1) 2700ms forwards;
        }
        .gs-vc-stage.is-playing .gs-vc-splash-side-r {
          animation: gs-vc-splash-in-r 700ms cubic-bezier(0.34,1.56,0.64,1) 2900ms forwards;
        }
        @keyframes gs-vc-splash-in-l { to { transform: translateX(0); } }
        @keyframes gs-vc-splash-in-r { to { transform: translateX(0); } }
        .gs-vc-splash-portrait {
          width: 60%; max-width: 200px;
          aspect-ratio: 1;
          display: flex; align-items: flex-end; justify-content: center;
          border-radius: 16px;
          padding: 8px;
          border: 2px solid rgba(255,253,247,0.35);
          background: rgba(11,30,63,0.45);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.45);
        }
        .gs-vc-splash-side-r .gs-vc-splash-portrait {
          background: rgba(232,98,42,0.55);
          border-color: rgba(255,253,247,0.55);
        }
        .gs-vc-splash-portrait svg { width: 100%; height: 100%; }
        .gs-vc-splash-banner {
          margin-top: 14px;
          padding: 6px 16px;
          background: ${INK};
          color: #FFFDF7;
          font-family: var(--font-display-stack);
          font-size: clamp(18px, 2.6vw, 30px);
          letter-spacing: 0.02em;
          line-height: 1;
          border-bottom: 3px solid ${PERSIMMON};
        }
        .gs-vc-splash-side-r .gs-vc-splash-banner {
          background: ${PERSIMMON};
          color: #FFFDF7;
          border-bottom-color: ${INK};
        }
        .gs-vc-splash-kicker {
          margin-top: 8px;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.36em;
          color: rgba(255,253,247,0.85);
          text-transform: uppercase;
          opacity: 0;
        }
        .gs-vc-stage.is-playing .gs-vc-splash-side-l .gs-vc-splash-kicker {
          animation: gs-vc-fade-in 400ms ease-out 3300ms forwards;
        }
        .gs-vc-stage.is-playing .gs-vc-splash-side-r .gs-vc-splash-kicker {
          animation: gs-vc-fade-in 400ms ease-out 3500ms forwards;
        }
        @keyframes gs-vc-fade-in { to { opacity: 1; } }

        .gs-vc-splash-vs {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) scale(0) rotate(-25deg);
          font-family: var(--font-display-stack);
          font-style: italic;
          font-size: clamp(96px, 18vw, 220px);
          font-weight: 400;
          letter-spacing: -0.04em;
          color: ${PERSIMMON};
          text-shadow:
            -3px -3px 0 ${INK},
             3px -3px 0 ${INK},
            -3px  3px 0 ${INK},
             3px  3px 0 ${INK},
             0 12px 30px rgba(0,0,0,0.6);
          line-height: 1;
          z-index: 2;
          opacity: 0;
        }
        .gs-vc-stage.is-playing .gs-vc-splash-vs {
          animation: gs-vc-vs-smash 1100ms cubic-bezier(0.34,1.56,0.64,1) 3200ms forwards,
                     gs-vc-vs-pulse 1.2s ease-in-out 4400ms infinite;
        }
        @keyframes gs-vc-vs-smash {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(3) rotate(-25deg); filter: blur(8px); }
          55%  { opacity: 1; transform: translate(-50%, -50%) scale(0.92) rotate(6deg); filter: blur(0); }
          75%  { transform: translate(-50%, -50%) scale(1.06) rotate(-3deg); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0); }
        }
        @keyframes gs-vc-vs-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0); }
          50%      { transform: translate(-50%, -50%) scale(1.05) rotate(-1.5deg); }
        }

        /* Fighters — character silhouettes */
        .gs-vc-fighter {
          position: absolute;
          bottom: 8%;
          width: 22%;
          height: 68%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          opacity: 0;
        }
        .gs-vc-fighter[data-side="left"]  { left: 6%;  transform: translateX(-40px); }
        .gs-vc-fighter[data-side="right"] { right: 6%; transform: translateX(40px); }
        .gs-vc-stage.is-playing .gs-vc-fighter[data-side="left"] {
          animation:
            gs-vc-fighter-in-l 700ms cubic-bezier(0.22,1,0.36,1) 5600ms forwards,
            gs-vc-fighter-idle 1.8s ease-in-out 6500ms infinite,
            gs-vc-consult-ko 900ms cubic-bezier(0.45,0,0.35,1) 15200ms forwards;
        }
        .gs-vc-stage.is-playing .gs-vc-fighter[data-side="right"] {
          animation:
            gs-vc-fighter-in-r 700ms cubic-bezier(0.22,1,0.36,1) 5700ms forwards,
            gs-vc-fighter-idle 1.8s ease-in-out 6600ms infinite,
            gs-vc-you-victory 900ms cubic-bezier(0.34,1.56,0.64,1) 16200ms forwards;
        }
        @keyframes gs-vc-fighter-in-l { to { opacity: 1; transform: translateX(0); } }
        @keyframes gs-vc-fighter-in-r { to { opacity: 1; transform: translateX(0); } }
        @keyframes gs-vc-fighter-idle {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes gs-vc-consult-ko {
          0%   { opacity: 1; filter: grayscale(0) brightness(1); transform: translateY(0) rotate(0); }
          30%  { opacity: 0.7; filter: grayscale(0.4) brightness(0.7); transform: translateY(-8px) rotate(-10deg); }
          60%  { filter: grayscale(0.9) brightness(0.55); }
          100% { opacity: 0; filter: grayscale(1) brightness(0.4); transform: translateY(24px) rotate(-22deg); }
        }
        @keyframes gs-vc-you-victory {
          0%   { transform: translateY(0) scale(1); }
          40%  { transform: translateY(-26px) scale(1.06); }
          70%  { transform: translateY(-12px) scale(1.02); }
          100% { transform: translateY(-16px) scale(1.04); }
        }
        .gs-vc-fighter svg {
          width: 100%; height: 100%;
          filter: drop-shadow(0 12px 18px rgba(0,0,0,0.35));
        }
        .gs-vc-fighter-label {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.22em;
          color: ${INK};
          font-weight: 700;
          white-space: nowrap;
          background: #FFFDF7;
          padding: 3px 10px;
          border-radius: 4px;
          border: 1px solid rgba(11,30,63,0.2);
          box-shadow: 0 4px 8px -4px rgba(0,0,0,0.25);
        }
        .gs-vc-fighter[data-side="right"] .gs-vc-fighter-label {
          background: ${PERSIMMON};
          color: #FFFDF7;
          border-color: ${PERSIMMON_DEEP};
        }

        /* Power-ups */
        .gs-vc-pu {
          position: absolute;
          top: 22%;
          left: 50%;
          width: 64px; height: 64px;
          margin-left: -32px;
          border-radius: 14px;
          background: linear-gradient(180deg, ${PERSIMMON}, ${PERSIMMON_DEEP});
          color: #FFFDF7;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 14px 28px -8px rgba(232,98,42,0.65),
            inset 0 -3px 0 rgba(0,0,0,0.22),
            inset 0 2px 0 rgba(255,255,255,0.2);
          opacity: 0;
          transform: translateY(-160px) rotate(-12deg);
          z-index: 5;
        }
        .gs-vc-pu-letter {
          font-family: var(--font-display-stack);
          font-size: 28px;
          font-weight: 400;
          line-height: 1;
        }
        .gs-vc-pu-label {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 8px;
          letter-spacing: 0.2em;
          margin-top: 4px;
          opacity: 0.92;
        }
        @keyframes gs-vc-pu-drop {
          0%   { opacity: 0; transform: translateY(-160px) rotate(-12deg) scale(0.6); }
          30%  { opacity: 1; transform: translateY(0) rotate(0) scale(1.12); }
          45%  { transform: translateY(0) rotate(0) scale(0.96); }
          55%  { transform: translateY(0) rotate(0) scale(1); }
          70%  { opacity: 1; transform: translateY(0) rotate(0) scale(1); }
          90%  { opacity: 0; transform: translateY(-20px) rotate(8deg) scale(0.6); }
          100% { opacity: 0; transform: translateY(-160px) rotate(-12deg) scale(0.5); }
        }
        .gs-vc-stage.is-playing .gs-vc-pu-1 { animation: gs-vc-pu-drop 1.8s cubic-bezier(0.34,1.56,0.64,1) 6800ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-pu-2 { animation: gs-vc-pu-drop 1.8s cubic-bezier(0.34,1.56,0.64,1) 8800ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-pu-3 { animation: gs-vc-pu-drop 1.8s cubic-bezier(0.34,1.56,0.64,1) 10800ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-pu-4 { animation: gs-vc-pu-drop 1.8s cubic-bezier(0.34,1.56,0.64,1) 12800ms forwards; }

        /* Attack beams */
        .gs-vc-beam {
          position: absolute;
          top: 55%;
          left: 50%;
          width: 0;
          height: 6px;
          margin-top: -3px;
          background: linear-gradient(90deg, transparent, rgba(232,98,42,0.95), #FFFFFF);
          box-shadow: 0 0 18px rgba(232,98,42,0.9);
          border-radius: 999px;
          transform-origin: right center;
          opacity: 0;
          z-index: 3;
        }
        @keyframes gs-vc-beam-fly {
          0%   { opacity: 0; width: 0; transform: translate(0, 0); }
          15%  { opacity: 1; width: 50%; transform: translate(-30%, 0); }
          50%  { opacity: 1; width: 60%; transform: translate(-60%, 0); }
          100% { opacity: 0; width: 0%;  transform: translate(-100%, 0); }
        }
        .gs-vc-stage.is-playing .gs-vc-beam-1 { animation: gs-vc-beam-fly 700ms cubic-bezier(0.4,0,0.2,1) 8400ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-beam-2 { animation: gs-vc-beam-fly 700ms cubic-bezier(0.4,0,0.2,1) 10400ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-beam-3 { animation: gs-vc-beam-fly 700ms cubic-bezier(0.4,0,0.2,1) 12400ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-beam-4 { animation: gs-vc-beam-fly 700ms cubic-bezier(0.4,0,0.2,1) 14400ms forwards; }

        /* Screen shake on each hit */
        .gs-vc-stage.is-playing {
          animation: gs-vc-shake 600ms cubic-bezier(0.36,0,0.66,-0.56) 8600ms,
                     gs-vc-shake 600ms cubic-bezier(0.36,0,0.66,-0.56) 10600ms,
                     gs-vc-shake 600ms cubic-bezier(0.36,0,0.66,-0.56) 12600ms,
                     gs-vc-shake 700ms cubic-bezier(0.36,0,0.66,-0.56) 14600ms;
        }
        @keyframes gs-vc-shake {
          0%, 100% { transform: translate(0, 0); }
          20%      { transform: translate(-6px, 2px); }
          40%      { transform: translate(5px, -2px); }
          60%      { transform: translate(-3px, 3px); }
          80%      { transform: translate(2px, -1px); }
        }

        /* Announcer smash text */
        .gs-vc-smash {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 8;
          pointer-events: none;
          font-family: var(--font-display-stack);
          font-weight: 400;
          text-shadow: 0 6px 22px rgba(0,0,0,0.4), 0 0 24px rgba(232,98,42,0.45);
          opacity: 0;
          letter-spacing: -0.01em;
          line-height: 1;
        }
        @keyframes gs-vc-smash {
          0%   { opacity: 0; transform: scale(2.8) rotate(-6deg); filter: blur(8px); }
          22%  { opacity: 1; transform: scale(0.9) rotate(2deg); filter: blur(0); }
          32%  { transform: scale(1.04) rotate(-1deg); }
          42%  { transform: scale(1) rotate(0); }
          80%  { opacity: 1; transform: scale(1) rotate(0); }
          100% { opacity: 0; transform: scale(0.92) rotate(0); }
        }
        .gs-vc-final  { font-size: clamp(48px, 8vw, 96px);  color: ${INK}; }
        .gs-vc-fight  { font-size: clamp(56px, 10vw, 128px); color: ${PERSIMMON_DEEP}; }
        .gs-vc-ko     { font-size: clamp(64px, 12vw, 156px); color: ${PERSIMMON_DEEP}; }
        .gs-vc-stamped{ font-size: clamp(52px, 9vw, 116px);  color: ${PERSIMMON_DEEP}; }

        .gs-vc-stage.is-playing .gs-vc-final   { animation: gs-vc-smash 1600ms cubic-bezier(0.22,1,0.36,1) 1000ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-fight   { animation: gs-vc-smash 1000ms cubic-bezier(0.22,1,0.36,1) 6000ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-ko      { animation: gs-vc-smash 1600ms cubic-bezier(0.22,1,0.36,1) 14800ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-stamped { animation: gs-vc-smash 1700ms cubic-bezier(0.22,1,0.36,1) 16200ms forwards; }

        /* Particle burst */
        .gs-vc-particles { position: absolute; inset: 0; pointer-events: none; z-index: 7; }
        .gs-vc-particle {
          position: absolute;
          top: 50%; left: 50%;
          width: 10px; height: 10px;
          border-radius: 999px;
          background: ${PERSIMMON};
          opacity: 0;
          box-shadow: 0 0 14px rgba(232,98,42,0.95);
        }
        @keyframes gs-vc-particle-burst {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          15%  { opacity: 1; transform: translate(var(--dx), var(--dy)) scale(1); }
          100% { opacity: 0; transform: translate(calc(var(--dx) * 1.6), calc(var(--dy) * 1.6)) scale(0.4); }
        }
        ${Array.from({ length: 14 })
          .map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const r = 180 + (i % 3) * 40;
            const dx = Math.cos(angle) * r;
            const dy = Math.sin(angle) * r;
            return `.gs-vc-particle-${i} { --dx: ${dx}px; --dy: ${dy}px; }`;
          })
          .join("\n")}
        .gs-vc-stage.is-playing .gs-vc-particle {
          animation: gs-vc-particle-burst 1.4s cubic-bezier(0.22,1,0.36,1) 16300ms forwards;
        }

        /* Outro headline */
        .gs-vc-outro {
          position: absolute;
          left: 50%;
          bottom: 6%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 6;
          opacity: 0;
        }
        .gs-vc-stage.is-playing .gs-vc-outro {
          animation: gs-vc-fade-in 900ms cubic-bezier(0.22,1,0.36,1) 17800ms forwards;
        }
        .gs-vc-outro-line {
          margin: 0;
          font-family: var(--font-display-stack);
          font-weight: 400;
          font-size: clamp(24px, 3.6vw, 44px);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: ${INK};
        }
        .gs-vc-outro-em em { font-style: italic; color: ${PERSIMMON_DEEP}; }

        /* Reduced motion fallback */
        @media (prefers-reduced-motion: reduce) {
          .gs-vc-stage *, .gs-vc-stage *::before, .gs-vc-stage *::after {
            animation: none !important;
            transition: none !important;
          }
          .gs-vc-floor, .gs-vc-spot, .gs-vc-hud { opacity: 1 !important; transform: none !important; }
          .gs-vc-splash, .gs-vc-pu, .gs-vc-beam, .gs-vc-smash:not(.gs-vc-stamped) { display: none !important; }
          .gs-vc-fighter[data-side="left"]  { opacity: 0 !important; }
          .gs-vc-fighter[data-side="right"] { opacity: 1 !important; transform: translateY(-16px) scale(1.04) !important; }
          .gs-vc-hp-you      { width: 100% !important; }
          .gs-vc-hp-consult  { width: 0% !important; }
          .gs-vc-stamped     { display: flex !important; opacity: 1 !important; transform: none !important; }
          .gs-vc-outro       { opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────── VS splash ── */

function VsSplash() {
  return (
    <div className="gs-vc-splash" data-anim="true" aria-hidden>
      <div className="gs-vc-splash-bg" />
      <div className="gs-vc-splash-side gs-vc-splash-side-l" data-anim="true">
        <div className="gs-vc-splash-portrait">
          <ConsultantSilhouette />
        </div>
        <span className="gs-vc-splash-banner">THE CONSULTANT</span>
        <span className="gs-vc-splash-kicker" data-anim="true">
          Reigning · Class A
        </span>
      </div>
      <div className="gs-vc-splash-side gs-vc-splash-side-r" data-anim="true">
        <div className="gs-vc-splash-portrait">
          <StudentSilhouette />
        </div>
        <span className="gs-vc-splash-banner">YOU</span>
        <span className="gs-vc-splash-kicker" data-anim="true">
          Challenger · 47 moves
        </span>
      </div>
      <span className="gs-vc-splash-vs" data-anim="true">
        VS
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────── fighter ── */

function Fighter({
  side,
  name,
  sub,
  kind,
}: {
  side: "left" | "right";
  name: string;
  sub: string;
  kind: "consultant" | "student";
}) {
  return (
    <div className="gs-vc-fighter" data-side={side} data-anim="true">
      <span className="gs-vc-fighter-label">{name}</span>
      {kind === "consultant" ? <ConsultantSilhouette /> : <StudentSilhouette />}
      <span
        style={{
          position: "absolute",
          bottom: -4,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 9,
          letterSpacing: "0.2em",
          color: INK_SOFT,
          whiteSpace: "nowrap",
        }}
      >
        {sub}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────── character silhouettes ── */

function ConsultantSilhouette(): ReactNode {
  // Boxy businessman in ink — suit, tie, briefcase, slight stoop.
  return (
    <svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="gs-vc-consult-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#1a2a48" />
          <stop offset="100%" stopColor="#0B1E3F" />
        </linearGradient>
      </defs>
      {/* Briefcase */}
      <g transform="translate(86 110)">
        <rect x="0" y="6" width="32" height="22" rx="2" fill="#0B1E3F" stroke="#000" strokeOpacity="0.18" />
        <rect x="11" y="2" width="10" height="6" rx="1" fill="none" stroke="#0B1E3F" strokeWidth="2" />
      </g>
      {/* Body */}
      <g fill="url(#gs-vc-consult-grad)">
        {/* Head */}
        <ellipse cx="60" cy="32" rx="18" ry="20" />
        {/* Neck */}
        <rect x="54" y="48" width="12" height="8" />
        {/* Suit jacket */}
        <path d="M30 56 L90 56 L100 105 L94 156 L26 156 L20 105 Z" />
        {/* Arm L (holds nothing, hangs) */}
        <path d="M30 60 L18 110 L24 118 L36 70 Z" />
        {/* Arm R (holds briefcase, extended) */}
        <path d="M90 60 L106 110 L100 120 L84 70 Z" />
        {/* Legs */}
        <path d="M36 156 L33 218 L52 218 L54 156 Z" />
        <path d="M84 156 L87 218 L68 218 L66 156 Z" />
      </g>
      {/* White shirt + tie */}
      <path d="M48 60 L72 60 L70 100 L60 110 L50 100 Z" fill="#FAF8F4" />
      <path d="M58 62 L62 62 L63 90 L60 100 L57 90 Z" fill={PERSIMMON_DEEP} />
      {/* Eyes (stern dots) */}
      <circle cx="54" cy="32" r="1.5" fill="#FAF8F4" />
      <circle cx="66" cy="32" r="1.5" fill="#FAF8F4" />
      {/* Mouth (small flat line) */}
      <rect x="54" y="42" width="12" height="1.4" fill="#FAF8F4" opacity="0.6" />
    </svg>
  );
}

function StudentSilhouette(): ReactNode {
  // Casual student in persimmon — hoodie, backpack strap, phone, light grin.
  return (
    <svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="gs-vc-stud-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#FF7A3D" />
          <stop offset="100%" stopColor="#E8622A" />
        </linearGradient>
      </defs>
      {/* Backpack peeking behind shoulders */}
      <rect x="20" y="62" width="14" height="60" rx="6" fill="#0B1E3F" opacity="0.85" />
      <rect x="86" y="62" width="14" height="60" rx="6" fill="#0B1E3F" opacity="0.85" />
      <rect x="34" y="64" width="52" height="58" rx="8" fill="#0B1E3F" opacity="0.9" />
      {/* Body — hoodie */}
      <g fill="url(#gs-vc-stud-grad)">
        {/* Head */}
        <ellipse cx="60" cy="32" rx="18" ry="20" />
        {/* Neck */}
        <rect x="54" y="48" width="12" height="8" />
        {/* Hoodie torso */}
        <path d="M30 56 L90 56 L98 110 L78 162 L42 162 L22 110 Z" />
        {/* Hoodie sleeves */}
        <path d="M30 60 L20 115 L28 122 L36 70 Z" />
        <path d="M90 60 L100 115 L92 122 L84 70 Z" />
      </g>
      {/* Jeans legs */}
      <g fill="#2A3F5F">
        <path d="M42 162 L38 218 L56 218 L58 162 Z" />
        <path d="M78 162 L82 218 L64 218 L62 162 Z" />
      </g>
      {/* Phone in left hand */}
      <rect x="14" y="118" width="14" height="22" rx="2" fill="#0B1E3F" />
      <rect x="16" y="121" width="10" height="14" rx="1" fill={PERSIMMON_DEEP} opacity="0.9" />
      {/* Hoodie pocket (V shape) */}
      <path d="M44 110 L60 124 L76 110 L76 130 L44 130 Z" fill={PERSIMMON_DEEP} opacity="0.55" />
      {/* Eyes */}
      <circle cx="54" cy="32" r="1.8" fill="#FAF8F4" />
      <circle cx="66" cy="32" r="1.8" fill="#FAF8F4" />
      {/* Confident grin */}
      <path d="M52 40 Q60 46 68 40" stroke="#FAF8F4" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ────────────────────────────────────────────── power-up ── */

function PowerUp({
  abbr,
  label,
  cls,
  beamCls,
}: {
  abbr: string;
  label: string;
  cls: string;
  beamCls: string;
}) {
  return (
    <>
      <div className={`gs-vc-pu ${cls}`} data-anim="true" aria-hidden>
        <span className="gs-vc-pu-letter">{abbr}</span>
        <span className="gs-vc-pu-label">{label}</span>
      </div>
      <span className={`gs-vc-beam ${beamCls}`} data-anim="true" aria-hidden />
    </>
  );
}

/* ────────────────────────────────────────────── smash text ── */

function SmashText({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`gs-vc-smash ${cls}`} data-anim="true" aria-hidden>
      {children}
    </span>
  );
}
