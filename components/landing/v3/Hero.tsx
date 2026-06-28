"use client";

import Link from "next/link";
import { motion } from "motion/react";
import FloatingLines from "@/components/ui/FloatingLines";
import TextType from "@/components/ui/TextType";
import { HeroInterviewCard } from "./HeroInterviewCard";

/* ════════════════════════════════════════════════════════════════════════
   Hero — Wavly-style two-column layout. Left column carries the eyebrow,
   typewriter headline, subtext, CTA row, and trust strip. Right column
   carries the glass mock-interview card. WebGL FloatingLines + typewriter
   animation are preserved verbatim from the prior Hero.
   ═════════════════════════════════════════════════════════════════════════ */

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};
const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section
      aria-label="Hero"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#000000",
      }}
      className="gs-hero-root"
    >
      {/* Layer 1 — WebGL light streaks (unchanged). */}
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
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={8}
          lineDistance={8}
          bendRadius={8}
          bendStrength={-2}
          interactive
          parallax
          animationSpeed={1}
          gradientStart="#ff7849"
          gradientMid="#ff2e88"
          gradientEnd="#2f1bff"
        />
      </div>

      {/* Layer 2 — ink gradient overlay for headline contrast. */}
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

      {/* Layer 3 — two-column content grid. */}
      <div
        className="gs-hero-grid mx-auto max-w-7xl"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "8rem 24px 5rem",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* ── Left column ── */}
        <div className="gs-hero-left">
          <motion.span
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, ease, delay: 0.05 }}
            className="gs-hero-eyebrow"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(232,98,42,0.12)",
              border: "1px solid rgba(232,98,42,0.35)",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "var(--color-forest)",
            }}
          >
            F-1 Student Visa · End-to-End
          </motion.span>

          <motion.h1
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, ease, delay: 0.15 }}
            className="gs-hero-headline"
            style={{
              fontFamily: "var(--font-display-stack)",
              fontWeight: 400,
              fontSize: "clamp(2.6rem, 6vw, 4rem)",
              color: "var(--color-cream-soft)",
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              margin: "20px 0 0 0",
              textWrap: "balance" as "balance",
              minHeight: "1.1em",
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
              cursorStyle={{ color: "var(--color-forest)" }}
            />
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, ease, delay: 0.27 }}
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 17,
              color: "rgba(250,248,244,0.66)",
              lineHeight: 1.65,
              maxWidth: 560,
              margin: "22px 0 0 0",
            }}
          >
            Forty-seven ordered steps. AI document checks trained on real consular failure
            modes. Voice mock interviews scored like the real thing. One workspace until your
            passport is stamped.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, ease, delay: 0.39 }}
            className="gs-hero-ctas"
            style={{
              marginTop: 30,
              display: "flex",
              gap: 14,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/sign-up" className="gs-hero-primary">
              Start free — Phase 1 forever
            </Link>
            <Link href="#how-it-works" className="gs-hero-secondary">
              <span aria-hidden style={{ display: "inline-block", marginRight: 6 }}>▸</span>
              Watch 60-second tour
            </Link>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.7, ease, delay: 0.51 }}
            className="gs-hero-stats"
            style={{
              marginTop: 36,
              display: "flex",
              gap: 28,
              alignItems: "center",
              flexWrap: "wrap",
              listStyle: "none",
              padding: 0,
              fontFamily: "var(--font-sans-stack)",
              fontSize: 10,
              color: "rgba(250,248,244,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            <li>47 Ordered Steps</li>
            <li aria-hidden style={{ color: "rgba(250,248,244,0.18)" }}>·</li>
            <li>200+ Real F-1 Questions</li>
            <li aria-hidden style={{ color: "rgba(250,248,244,0.18)" }}>·</li>
            <li>One-Time Payment</li>
          </motion.ul>
        </div>

        {/* ── Right column — glass mock-interview card ── */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, ease, delay: 0.3 }}
          className="gs-hero-right"
        >
          <HeroInterviewCard />
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .gs-hero-grid {
            grid-template-columns: 7fr 5fr !important;
            gap: 64px !important;
            padding: 10rem 40px 7rem !important;
          }
        }
        .gs-hero-primary {
          background: var(--color-forest);
          color: var(--color-cream-soft);
          font-family: var(--font-sans-stack);
          font-size: 14px;
          font-weight: 600;
          padding: 12px 22px;
          border-radius: 10px;
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
            background: var(--color-forest-deep);
            transform: translateY(-1px);
            box-shadow: 0 8px 28px rgba(232,98,42,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
          }
        }
        .gs-hero-primary:active { transform: translateY(0) scale(0.98); }

        .gs-hero-secondary {
          font-family: var(--font-sans-stack);
          font-size: 14px;
          color: rgba(250,248,244,0.78);
          border: 1px solid rgba(250,248,244,0.20);
          background: transparent;
          border-radius: 10px;
          padding: 11px 18px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: border-color 200ms ease, color 200ms ease, background-color 200ms ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .gs-hero-secondary:hover {
            color: var(--color-cream-soft);
            border-color: rgba(250,248,244,0.45);
            background: rgba(250,248,244,0.04);
          }
        }

        /* Mobile tuning */
        @media (max-width: 767px) {
          .gs-hero-root { min-height: 100svh !important; }
          .gs-hero-headline { font-size: clamp(2.2rem, 9vw, 3rem) !important; }
          .gs-hero-ctas { width: 100%; }
          .gs-hero-ctas > a {
            flex: 1;
            justify-content: center;
          }
          .gs-hero-stats { gap: 16px !important; font-size: 9px !important; }
        }
      `}</style>
    </section>
  );
}
