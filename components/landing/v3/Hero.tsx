"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "motion/react";
import Hyperspeed from "@/components/ui/Hyperspeed";
import TextType from "@/components/ui/TextType";

/* ════════════════════════════════════════════════════════════════════════
   Hero — full-bleed Ink panel with a Lightfall WebGL backdrop. The old
   macOS-window video frame is gone; the streaks are the atmosphere now.
   All text + CTAs are preserved verbatim from the prior Hero so brand
   voice is untouched.
   ═════════════════════════════════════════════════════════════════════════ */

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};
const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const hyperspeedOptions = useMemo(
    () => ({
      onSpeedUp: () => {},
      onSlowDown: () => {},
      distortion: "turbulentDistortion",
      length: 400,
      roadWidth: 10,
      islandWidth: 2,
      lanesPerRoad: 4,
      fov: 90,
      fovSpeedUp: 150,
      speedUp: 2,
      carLightsFade: 0.4,
      totalSideLightSticks: 20,
      lightPairsPerRoadWay: 40,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5],
      lightStickHeight: [1.3, 1.7],
      movingAwaySpeed: [60, 80],
      movingCloserSpeed: [-120, -160],
      carLightsLength: [400 * 0.03, 400 * 0.2],
      carLightsRadius: [0.05, 0.14],
      carWidthPercentage: [0.3, 0.5],
      carShiftX: [-0.8, 0.8],
      carFloorSeparation: [0, 5],
      colors: {
        roadColor: 0x000000,
        islandColor: 0x000000,
        background: 0x000000,
        shoulderLines: 0xffffff,
        brokenLines: 0xffffff,
        leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
        rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
        sticks: 0x03b3c3,
      },
    }),
    []
  );

  return (
    <section
      aria-label="Hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 640,
        overflow: "hidden",
        background: "#000000",
      }}
      className="gs-hero-root"
    >
      {/* Layer 1 — WebGL light streaks. Lightfall fills the 100%×100%
          of this wrapper via .lightfall-container CSS; the wrapper
          handles the absolute positioning behind the Hero content. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>

      {/* Layer 2 — subtle ink gradient overlay so headline stays readable */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Layer 3 — content */}
      <div
        className="gs-hero-content"
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        {/* 1. Eyebrow */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 10,
            color: "#E8622A",
            textTransform: "uppercase",
            letterSpacing: "0.5em",
            fontWeight: 600,
            margin: 0,
            marginBottom: 24,
          }}
        >
          F-1 Student Visa · End-to-End
        </motion.p>

        {/* 2. Headline — typewriter cycling through three brand lines.
            All other Hero copy/structure is unchanged. */}
        <motion.h1
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease, delay: 0.4 }}
          className="gs-hero-headline"
          style={{
            fontFamily: "var(--font-display-stack)",
            fontWeight: 400,
            fontSize: "clamp(48px, 8vw, 88px)",
            color: "#FAF8F4",
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            margin: 0,
            textAlign: "center",
            textWrap: "balance" as "balance",
            minHeight: "1.05em",
          }}
        >
          <TextType
            text={["The only visa tool", "you will ever need.", "Get Stamped."]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor
            cursorCharacter="_"
            texts={[
              "The only visa tool you will ever need.",
              "47 steps. Nothing skipped.",
              "Built for your stamp.",
            ]}
            deletingSpeed={50}
            variableSpeedEnabled={false}
            variableSpeedMin={60}
            variableSpeedMax={120}
            cursorBlinkDuration={0.5}
            cursorStyle={{ color: "#E8622A" }}
          />
        </motion.h1>

        {/* 3. Subhead */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, ease, delay: 0.5 }}
          className="gs-hero-sub"
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 17,
            color: "rgba(250,248,244,0.60)",
            lineHeight: 1.65,
            maxWidth: 560,
            margin: "24px auto 0",
          }}
        >
          Forty-seven ordered steps. AI document checks trained on real consular failure
          modes. Voice mock interviews scored like the real thing. One workspace until your
          passport is stamped.
        </motion.p>

        {/* 4. CTA row */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease, delay: 0.7 }}
          className="gs-hero-ctas"
          style={{
            marginTop: 40,
            display: "flex",
            gap: 16,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/sign-up" className="gs-hero-primary">
            Start free — Phase 1 forever
          </Link>
        </motion.div>

        {/* 5. Stats row */}
        <motion.ul
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, ease, delay: 0.9 }}
          className="gs-hero-stats"
          style={{
            marginTop: 48,
            display: "flex",
            gap: 32,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            listStyle: "none",
            padding: 0,
            margin: "48px 0 0 0",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 10,
            color: "rgba(250,248,244,0.30)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          <li>47 Ordered Steps</li>
          <li aria-hidden style={{ color: "rgba(250,248,244,0.15)" }}>·</li>
          <li>200+ Real F-1 Questions</li>
          <li aria-hidden style={{ color: "rgba(250,248,244,0.15)" }}>·</li>
          <li>One-Time Payment</li>
        </motion.ul>
      </div>

      {/* 6. Scroll indicator — vertical line with a dot sliding down */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease, delay: 1.2 }}
        aria-hidden
        className="gs-hero-scrollcue"
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          width: 1,
          height: 40,
          background: "rgba(250,248,244,0.2)",
          pointerEvents: "none",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: -1,
            top: 0,
            width: 3,
            height: 8,
            background: "#E8622A",
            borderRadius: 999,
            animation: "gs-hero-cue 1.5s ease-in-out infinite",
          }}
        />
      </motion.div>

      <style>{`
        .gs-hero-primary {
          background: #E8622A;
          color: #FAF8F4;
          font-family: var(--font-sans-stack);
          font-size: 15px;
          font-weight: 600;
          padding: 16px 32px;
          border-radius: 999px;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(232,98,42,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .gs-hero-primary:hover {
            background: #F07040;
            transform: translateY(-1px);
            box-shadow: 0 8px 28px rgba(232,98,42,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
          }
        }
        .gs-hero-primary:active { transform: translateY(0) scale(0.98); }

        .gs-hero-secondary {
          background: transparent;
          color: rgba(250,248,244,0.70);
          font-family: var(--font-sans-stack);
          font-size: 14px;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 4px;
          transition: color 200ms ease;
        }
        .gs-hero-secondary span:last-child,
        .gs-hero-secondary {
          text-underline-offset: 4px;
        }
        @media (hover: hover) and (pointer: fine) {
          .gs-hero-secondary:hover {
            color: rgba(250,248,244,1);
            text-decoration: underline;
          }
        }

        @keyframes gs-hero-cue {
          0%   { transform: translateY(0); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(32px); opacity: 0; }
        }

        /* Mobile tuning per spec */
        @media (max-width: 767px) {
          .gs-hero-root { height: 100svh !important; }
          .gs-hero-headline { font-size: clamp(36px, 10vw, 52px) !important; }
          .gs-hero-sub { font-size: 15px !important; max-width: 100% !important; }
          .gs-hero-ctas { flex-direction: column !important; gap: 12px !important; width: 100%; }
          .gs-hero-ctas .gs-hero-primary,
          .gs-hero-ctas .gs-hero-secondary {
            width: 100%;
            justify-content: center;
          }
          .gs-hero-stats { gap: 16px !important; font-size: 9px !important; }
        }
      `}</style>
    </section>
  );
}
