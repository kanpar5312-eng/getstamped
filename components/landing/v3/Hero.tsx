"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Lightfall from "@/components/ui/Lightfall";
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

function PlayTriangle() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 0,
        height: 0,
        borderTop: "5px solid transparent",
        borderBottom: "5px solid transparent",
        borderLeft: "8px solid #E8622A",
      }}
    />
  );
}

export function Hero() {
  return (
    <section
      aria-label="Hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 640,
        overflow: "hidden",
        background: "#1C1917",
      }}
      className="gs-hero-root"
    >
      {/* Layer 1 — WebGL light streaks. Animation params match the
          reference Lightfall demo exactly; only colours are swapped to
          the GetStamped Ink + Persimmon + Paper palette. */}
      <Lightfall
        backgroundColor="#1C1917"
        speed={0.5}
        streakCount={2}
        streakWidth={1}
        streakLength={1}
        glow={1}
        density={0.6}
        twinkle={1}
        zoom={3}
        backgroundGlow={0.5}
        opacity={1}
        mouseInteraction
        mouseStrength={0.5}
        mouseRadius={1}
        color1="#E8622A"
        color2="#FAF8F4"
        color3="#FF9F70"
      />

      {/* Layer 2 — subtle ink gradient overlay so headline stays readable */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(28,25,23,0.15) 0%, rgba(28,25,23,0.05) 40%, rgba(28,25,23,0.35) 100%)",
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
          <button
            type="button"
            className="gs-hero-secondary"
            onClick={() => {
              const el = document.getElementById("playbook");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <PlayTriangle />
            Watch a 60-second tour
          </button>
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
