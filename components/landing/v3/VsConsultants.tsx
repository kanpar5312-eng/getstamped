"use client";

import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   VsConsultants — a 20-second fighting-game cutscene that plays
   inside an "arcade screen" frame. Sits between StackedFeatureCards
   and Pricing. Additive only — nothing else on the site is touched.

   Scene structure (every beat is a sound cue for later):
     0.0s  ARENA fades up; persimmon spotlight beams pulse
     1.0s  TITLE: "FINAL ROUND · F-1 VISA" smashes in with screen shake
     2.6s  Title clears; "READY?" flickers
     3.4s  "FIGHT!" smashes in
     3.4s  Fighters slide in (THE CONSULTANT left, YOU right)
     4.4s  HP bars fill (both 100%)
     5.2s  POWER-UP #1 PLAYBOOK drops → attack beam → consultant HP −25
     7.2s  POWER-UP #2 VAULT drops → attack → HP −25
     9.2s  POWER-UP #3 MOCK drops → attack → HP −25
    11.2s  POWER-UP #4 PARENT drops → attack → HP 0
    13.2s  "K.O.!" smashes in, consultant flickers + slides away
    14.6s  "STAMPED!" achievement unlocks with particle burst
    16.2s  Final headline: "Your visa, on your timetable."
    18.0s  Replay button appears
    20.0s  Hold

   Auto-plays once via IntersectionObserver. Replay button restarts
   the whole cutscene. Reduced-motion users get the end state.
   Brand discipline: cream + ink + persimmon only. No neon, no purple.
   The "arcade" feel is composition + timing, not the palette.
   ═════════════════════════════════════════════════════════════════════════ */

const PERSIMMON = "#E8622A";
const PERSIMMON_DEEP = "#B85A15";
const INK = "#0B1E3F";
const INK_SOFT = "#2A3F5F";
const PAPER = "#FAF8F4";
const CREAM = "#F5F1E8";

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
    // Force a remount of the stage so every keyframe restarts from 0.
    setPlaying(false);
    setPlayKey((k) => k + 1);
    // Re-arm next tick so React applies the removal first.
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)));
  };

  return (
    <section
      ref={rootRef}
      aria-label="GetStamped vs. consultants — cutscene"
      style={{
        position: "relative",
        background: INK,
        padding: "clamp(64px, 8vw, 112px) clamp(16px, 4vw, 48px)",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      {/* Ambient spotlight halos behind the screen */}
      <span aria-hidden className="gs-vc-halo gs-vc-halo-l" />
      <span aria-hidden className="gs-vc-halo gs-vc-halo-r" />

      {/* Section title — outside the screen */}
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
            color: PAPER,
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
            color: "rgba(250,248,244,0.7)",
          }}
        >
          Press play. Twenty seconds, four power-ups, one finish.
        </p>
      </header>

      {/* The arcade screen */}
      <div
        className="gs-vc-frame"
        style={{
          position: "relative",
          maxWidth: 1100,
          margin: "clamp(36px, 5vw, 56px) auto 0",
          borderRadius: 22,
          padding: 14,
          background: "linear-gradient(180deg, #1a2a48 0%, #0b1a35 100%)",
          border: "1px solid rgba(250,248,244,0.12)",
          boxShadow:
            "0 50px 100px -40px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,98,42,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Bezel mono label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px 10px",
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 10,
            letterSpacing: "0.28em",
            color: "rgba(250,248,244,0.45)",
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
                boxShadow: "0 0 8px rgba(232,98,42,0.7)",
                animation: "gs-vc-rec 1.4s ease-in-out infinite",
              }}
            />
            REC · CABINET 47
          </span>
          <span>GS-ARCADE / F-1</span>
        </div>

        {/* The actual stage (16:9, swappable by key for replay) */}
        <Stage key={playKey} playing={playing} />

        {/* Replay button under the screen */}
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
        /* REC dot pulse on bezel */
        @keyframes gs-vc-rec {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }

        /* Ambient halos behind the screen */
        .gs-vc-halo {
          position: absolute;
          width: 720px; height: 720px;
          border-radius: 999px;
          background: radial-gradient(closest-side, rgba(232,98,42,0.28), transparent 70%);
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

        /* Replay button */
        .gs-vc-replay {
          display: inline-flex;
          align-items: center;
          padding: 10px 22px;
          border-radius: 999px;
          background: ${PERSIMMON};
          color: ${PAPER};
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
        background:
          "radial-gradient(ellipse at center 70%, #1a2c50 0%, #0b1a35 65%, #050d1d 100%)",
        boxShadow: "inset 0 0 0 1px rgba(250,248,244,0.06)",
      }}
    >
      {/* Perspective grid floor */}
      <div className="gs-vc-floor" aria-hidden>
        <div className="gs-vc-floor-grid" />
        <div className="gs-vc-floor-fade" />
      </div>

      {/* Spotlight cones from the top */}
      <span aria-hidden className="gs-vc-spot gs-vc-spot-l" />
      <span aria-hidden className="gs-vc-spot gs-vc-spot-r" />

      {/* HUD — HP bars + round indicator */}
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

      {/* Fighters */}
      <Fighter
        side="left"
        label="THE CONSULTANT"
        sub="Office hours · Class A"
        icon="briefcase"
        koClass="gs-vc-consult"
      />
      <Fighter
        side="right"
        label="YOU"
        sub="+ GetStamped"
        icon="stamp"
        koClass="gs-vc-you"
      />

      {/* Power-up drops + attack beams */}
      <PowerUp delay={5200} label="PLAYBOOK"   abbr="P" cls="gs-vc-pu-1" beamCls="gs-vc-beam-1" />
      <PowerUp delay={7200} label="VAULT"      abbr="V" cls="gs-vc-pu-2" beamCls="gs-vc-beam-2" />
      <PowerUp delay={9200} label="MOCK"       abbr="M" cls="gs-vc-pu-3" beamCls="gs-vc-beam-3" />
      <PowerUp delay={11200} label="PARENT"    abbr="S" cls="gs-vc-pu-4" beamCls="gs-vc-beam-4" />

      {/* Big smash-in announcer text — one element per beat */}
      <SmashText cls="gs-vc-final">FINAL ROUND</SmashText>
      <SmashText cls="gs-vc-ready">READY?</SmashText>
      <SmashText cls="gs-vc-fight">FIGHT!</SmashText>
      <SmashText cls="gs-vc-ko">K.O.!</SmashText>
      <SmashText cls="gs-vc-stamped">STAMPED!</SmashText>

      {/* Particle burst (used at STAMPED moment) */}
      <div className="gs-vc-particles" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className={`gs-vc-particle gs-vc-particle-${i}`} />
        ))}
      </div>

      {/* Final outro card under the headline */}
      <div className="gs-vc-outro" aria-hidden>
        <p className="gs-vc-outro-line">Your visa.</p>
        <p className="gs-vc-outro-line gs-vc-outro-em">
          <em>On your timetable.</em>
        </p>
      </div>

      <style>{`
        /* ──────────────────────────────────────────────────────────────
           Pause every cutscene animation until the stage is .is-playing.
           Each element below uses animation-fill-mode: both so it sits
           at its "before" frame until released, then settles on its
           "after" frame.
           ────────────────────────────────────────────────────────────── */
        .gs-vc-stage *[data-anim] {
          animation-play-state: paused;
          animation-fill-mode: both;
        }
        .gs-vc-stage.is-playing *[data-anim] {
          animation-play-state: running;
        }

        /* Perspective grid floor — runs continuously while playing */
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
          top: 55%;
          height: 80%;
          transform-origin: 50% 0%;
          transform: rotateX(70deg);
          background-image:
            linear-gradient(rgba(232,98,42,0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,98,42,0.25) 1px, transparent 1px);
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
          left: 0; right: 0; top: 55%; bottom: 0;
          background: linear-gradient(180deg, transparent, rgba(5,13,29,0.85));
          pointer-events: none;
        }

        /* Spotlight cones */
        .gs-vc-spot {
          position: absolute;
          width: 360px; height: 80%;
          top: -8%;
          background: radial-gradient(ellipse at top, rgba(232,98,42,0.35), transparent 65%);
          mask-image: linear-gradient(180deg, #000 0%, transparent 80%);
          pointer-events: none;
          opacity: 0;
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

        /* HUD bars */
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
          animation: gs-vc-fade-down 600ms cubic-bezier(0.22,1,0.36,1) 4400ms forwards;
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
          color: rgba(250,248,244,0.7);
          font-weight: 600;
        }
        .gs-vc-hp {
          height: 10px;
          width: 100%;
          background:
            repeating-linear-gradient(90deg, rgba(250,248,244,0.06) 0 6px, transparent 6px 7px),
            rgba(11,30,63,0.55);
          border: 1px solid rgba(250,248,244,0.18);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
          box-shadow: inset 0 1px 0 rgba(0,0,0,0.4);
        }
        .gs-vc-hp-bar {
          position: absolute; top: 0; bottom: 0; left: 0;
          width: 0%;
          background: linear-gradient(90deg, ${PERSIMMON}, ${PERSIMMON_DEEP});
          box-shadow: 0 0 12px rgba(232,98,42,0.7);
          transition: none;
        }
        .gs-vc-stage.is-playing .gs-vc-hp-you {
          animation: gs-vc-hp-fill 800ms cubic-bezier(0.22,1,0.36,1) 4500ms forwards;
        }
        @keyframes gs-vc-hp-fill {
          to { width: 100%; }
        }
        .gs-vc-stage.is-playing .gs-vc-hp-consult {
          /* Fill to 100, then drain in 4 staged hits at each power-up beat. */
          animation: gs-vc-hp-drain 14000ms steps(1, end) 4500ms forwards;
        }
        @keyframes gs-vc-hp-drain {
          0%     { width: 0%;   }
          5%     { width: 100%; }
          /* PU#1 hit ≈ 7.0s → t = 2500/14000 ≈ 17.8% */
          18%    { width: 100%; }
          19%    { width: 75%;  }
          /* PU#2 hit ≈ 9.0s → t = 4500/14000 ≈ 32% */
          32%    { width: 75%;  }
          33%    { width: 50%;  }
          /* PU#3 hit ≈ 11.0s → t = 6500/14000 ≈ 46% */
          46%    { width: 50%;  }
          47%    { width: 25%;  }
          /* PU#4 hit ≈ 13.0s → t = 8500/14000 ≈ 61% */
          61%    { width: 25%;  }
          62%    { width: 0%;   }
          100%   { width: 0%;   }
        }
        .gs-vc-round-indicator {
          display: flex; flex-direction: column; align-items: center;
          padding: 4px 10px;
          border: 1px solid rgba(232,98,42,0.45);
          border-radius: 6px;
          background: rgba(232,98,42,0.12);
        }
        .gs-vc-round-num {
          font-family: var(--font-display-stack);
          font-size: 16px;
          color: ${PERSIMMON};
          letter-spacing: 0.04em;
          line-height: 1;
        }
        .gs-vc-round-label {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 8px;
          letter-spacing: 0.32em;
          color: rgba(250,248,244,0.55);
          margin-top: 2px;
        }

        /* Fighters */
        .gs-vc-fighter {
          position: absolute;
          bottom: 14%;
          width: 18%;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
        }
        .gs-vc-fighter[data-side="left"]  { left: 8%; transform: translateX(-40px); }
        .gs-vc-fighter[data-side="right"] { right: 8%; transform: translateX(40px); }

        .gs-vc-stage.is-playing .gs-vc-fighter[data-side="left"] {
          animation:
            gs-vc-fighter-in-l 800ms cubic-bezier(0.22,1,0.36,1) 3400ms forwards,
            gs-vc-fighter-idle 1.6s ease-in-out 4400ms infinite,
            gs-vc-consult-ko 800ms cubic-bezier(0.45,0,0.35,1) 13800ms forwards;
        }
        .gs-vc-stage.is-playing .gs-vc-fighter[data-side="right"] {
          animation:
            gs-vc-fighter-in-r 800ms cubic-bezier(0.22,1,0.36,1) 3500ms forwards,
            gs-vc-fighter-idle 1.6s ease-in-out 4500ms infinite,
            gs-vc-you-victory 900ms cubic-bezier(0.34,1.56,0.64,1) 14600ms forwards;
        }
        @keyframes gs-vc-fighter-in-l { to { opacity: 1; transform: translateX(0); } }
        @keyframes gs-vc-fighter-in-r { to { opacity: 1; transform: translateX(0); } }
        @keyframes gs-vc-fighter-idle {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes gs-vc-consult-ko {
          0%   { opacity: 1; filter: grayscale(0) brightness(1); transform: translateY(0) rotate(0); }
          30%  { opacity: 0.7; filter: grayscale(0.5) brightness(0.7); transform: translateY(-6px) rotate(-8deg); }
          60%  { filter: grayscale(1) brightness(0.5); }
          100% { opacity: 0; filter: grayscale(1) brightness(0.4); transform: translateY(20px) rotate(-18deg); }
        }
        @keyframes gs-vc-you-victory {
          0%   { transform: translateY(0) scale(1); }
          40%  { transform: translateY(-22px) scale(1.05); }
          70%  { transform: translateY(-10px) scale(1.02); }
          100% { transform: translateY(-14px) scale(1.04); }
        }

        .gs-vc-fighter-disc {
          width: 100%; height: 100%;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background:
            radial-gradient(circle at 35% 25%, rgba(255,255,255,0.18), transparent 50%),
            ${INK_SOFT};
          border: 2px solid rgba(250,248,244,0.18);
          box-shadow:
            0 18px 36px -12px rgba(0,0,0,0.55),
            inset 0 -8px 16px rgba(0,0,0,0.4);
          color: ${PAPER};
        }
        .gs-vc-fighter[data-side="right"] .gs-vc-fighter-disc {
          background:
            radial-gradient(circle at 35% 25%, rgba(255,255,255,0.22), transparent 50%),
            ${PERSIMMON};
          border-color: rgba(255,255,255,0.4);
          box-shadow:
            0 18px 36px -12px rgba(232,98,42,0.55),
            inset 0 -8px 16px rgba(0,0,0,0.25);
        }
        .gs-vc-fighter-label {
          position: absolute;
          top: -34px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(250,248,244,0.7);
          font-weight: 600;
          white-space: nowrap;
        }
        .gs-vc-fighter-sub {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 9px;
          letter-spacing: 0.18em;
          color: rgba(250,248,244,0.45);
          white-space: nowrap;
        }

        /* Power-ups — drop from top, scale-pop, fade. */
        .gs-vc-pu {
          position: absolute;
          top: 18%;
          left: 50%;
          width: 64px; height: 64px;
          margin-left: -32px;
          border-radius: 14px;
          background: linear-gradient(180deg, ${PERSIMMON}, ${PERSIMMON_DEEP});
          color: ${PAPER};
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
          letter-spacing: 0;
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
        .gs-vc-stage.is-playing .gs-vc-pu-1 { animation: gs-vc-pu-drop 1.8s cubic-bezier(0.34,1.56,0.64,1) 5200ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-pu-2 { animation: gs-vc-pu-drop 1.8s cubic-bezier(0.34,1.56,0.64,1) 7200ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-pu-3 { animation: gs-vc-pu-drop 1.8s cubic-bezier(0.34,1.56,0.64,1) 9200ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-pu-4 { animation: gs-vc-pu-drop 1.8s cubic-bezier(0.34,1.56,0.64,1) 11200ms forwards; }

        /* Attack beams — fly from right to left after the power-up hits. */
        .gs-vc-beam {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 6px;
          margin-top: -3px;
          background: linear-gradient(90deg, transparent, rgba(232,98,42,0.95), #FFFFFF);
          box-shadow: 0 0 18px rgba(232,98,42,0.8);
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
        .gs-vc-stage.is-playing .gs-vc-beam-1 { animation: gs-vc-beam-fly 700ms cubic-bezier(0.4,0,0.2,1) 6800ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-beam-2 { animation: gs-vc-beam-fly 700ms cubic-bezier(0.4,0,0.2,1) 8800ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-beam-3 { animation: gs-vc-beam-fly 700ms cubic-bezier(0.4,0,0.2,1) 10800ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-beam-4 { animation: gs-vc-beam-fly 700ms cubic-bezier(0.4,0,0.2,1) 12800ms forwards; }

        /* Screen shake fires at each hit moment. */
        .gs-vc-stage.is-playing {
          animation: gs-vc-shake 600ms cubic-bezier(0.36,0,0.66,-0.56) 7000ms,
                     gs-vc-shake 600ms cubic-bezier(0.36,0,0.66,-0.56) 9000ms,
                     gs-vc-shake 600ms cubic-bezier(0.36,0,0.66,-0.56) 11000ms,
                     gs-vc-shake 700ms cubic-bezier(0.36,0,0.66,-0.56) 13000ms;
        }
        @keyframes gs-vc-shake {
          0%, 100% { transform: translate(0, 0); }
          20%      { transform: translate(-6px, 2px); }
          40%      { transform: translate(5px, -2px); }
          60%      { transform: translate(-3px, 3px); }
          80%      { transform: translate(2px, -1px); }
        }

        /* Smash-in announcer text */
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
          color: ${PAPER};
          text-shadow: 0 6px 22px rgba(0,0,0,0.6), 0 0 24px rgba(232,98,42,0.5);
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
        .gs-vc-final  { font-size: clamp(48px, 8vw, 96px); }
        .gs-vc-ready  { font-size: clamp(40px, 7vw, 84px); color: ${PERSIMMON}; }
        .gs-vc-fight  { font-size: clamp(56px, 10vw, 128px); color: ${PERSIMMON}; }
        .gs-vc-ko     { font-size: clamp(64px, 12vw, 156px); color: ${PERSIMMON}; }
        .gs-vc-stamped{ font-size: clamp(52px, 9vw, 116px); color: ${PERSIMMON}; }

        .gs-vc-stage.is-playing .gs-vc-final   { animation: gs-vc-smash 2000ms cubic-bezier(0.22,1,0.36,1) 1000ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-ready   { animation: gs-vc-smash  900ms cubic-bezier(0.22,1,0.36,1) 2600ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-fight   { animation: gs-vc-smash 1000ms cubic-bezier(0.22,1,0.36,1) 3400ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-ko      { animation: gs-vc-smash 1600ms cubic-bezier(0.22,1,0.36,1) 13200ms forwards; }
        .gs-vc-stage.is-playing .gs-vc-stamped { animation: gs-vc-smash 1700ms cubic-bezier(0.22,1,0.36,1) 14600ms forwards; }

        /* Particle burst at STAMPED */
        .gs-vc-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 7;
        }
        .gs-vc-particle {
          position: absolute;
          top: 50%; left: 50%;
          width: 8px; height: 8px;
          border-radius: 999px;
          background: ${PERSIMMON};
          opacity: 0;
          box-shadow: 0 0 10px rgba(232,98,42,0.9);
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
          animation: gs-vc-particle-burst 1.4s cubic-bezier(0.22,1,0.36,1) 14700ms forwards;
        }

        /* Outro headline that lingers after the cutscene */
        .gs-vc-outro {
          position: absolute;
          left: 50%;
          bottom: 8%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 6;
          opacity: 0;
        }
        .gs-vc-stage.is-playing .gs-vc-outro {
          animation: gs-vc-fade-in 900ms cubic-bezier(0.22,1,0.36,1) 16200ms forwards;
        }
        @keyframes gs-vc-fade-in {
          to { opacity: 1; }
        }
        .gs-vc-outro-line {
          margin: 0;
          font-family: var(--font-display-stack);
          font-weight: 400;
          font-size: clamp(28px, 4.4vw, 56px);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: ${PAPER};
        }
        .gs-vc-outro-em em {
          font-style: italic;
          color: ${PERSIMMON};
        }

        /* Reduced motion fallback — show the end state. */
        @media (prefers-reduced-motion: reduce) {
          .gs-vc-stage *, .gs-vc-stage *::before, .gs-vc-stage *::after {
            animation: none !important;
            transition: none !important;
          }
          .gs-vc-floor, .gs-vc-spot, .gs-vc-hud { opacity: 1 !important; transform: none !important; }
          .gs-vc-fighter[data-side="left"]  { opacity: 0 !important; }
          .gs-vc-fighter[data-side="right"] { opacity: 1 !important; transform: translateY(-14px) scale(1.04) !important; }
          .gs-vc-hp-you      { width: 100% !important; }
          .gs-vc-hp-consult  { width: 0% !important; }
          .gs-vc-pu          { display: none !important; }
          .gs-vc-beam        { display: none !important; }
          .gs-vc-smash       { display: none !important; }
          .gs-vc-stamped     { display: flex !important; opacity: 1 !important; transform: none !important; }
          .gs-vc-outro       { opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────── fighter ── */

function Fighter({
  side,
  label,
  sub,
  icon,
  koClass,
}: {
  side: "left" | "right";
  label: string;
  sub: string;
  icon: "briefcase" | "stamp";
  koClass: string;
}) {
  return (
    <div
      className={`gs-vc-fighter ${koClass}`}
      data-side={side}
      data-anim="true"
    >
      <span className="gs-vc-fighter-label">{label}</span>
      <div className="gs-vc-fighter-disc">
        {icon === "briefcase" ? (
          <svg viewBox="0 0 24 24" width="42%" height="42%" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M3 13h18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="42%" height="42%" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 21h14" />
            <path d="M12 17V9" />
            <path d="M9 9h6l-1-4h-4l-1 4z" />
            <path d="M7 17h10v-2H7z" />
          </svg>
        )}
      </div>
      <span className="gs-vc-fighter-sub">{sub}</span>
    </div>
  );
}

/* ────────────────────────────────────────────── power-up + beam ── */

function PowerUp({
  label,
  abbr,
  cls,
  beamCls,
}: {
  delay: number;
  label: string;
  abbr: string;
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
