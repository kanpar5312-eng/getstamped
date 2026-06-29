"use client";

import Link from "next/link";
import { motion } from "motion/react";
import TextType from "@/components/ui/TextType";

/* ════════════════════════════════════════════════════════════════════════
   Hero — warm editorial. Cream bg, ink serif headline (TextType cycling),
   persimmon CTA, and a continuously-scrolling Playbook teaser below the
   CTA that fades into the next section — the visual cliffhanger that
   pulls the user down.
   ═════════════════════════════════════════════════════════════════════════ */

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};
const ease = [0.22, 1, 0.36, 1] as const;

const CREAM = "#F5F1E8";
const INK = "#0B1E3F";
const INK_SOFT = "#2A3F5F";
const PERSIMMON = "#E8622A";

type StepStatus = "done" | "current" | "upcoming";
type Step = { n: number; label: string; date: string; status: StepStatus };

const STEPS: Step[] = [
  { n: 11, label: "Receive I-20 from school", date: "Feb 28", status: "done" },
  { n: 12, label: "Pay SEVIS I-901 fee", date: "Mar 03", status: "done" },
  { n: 13, label: "Complete DS-160 form", date: "Mar 07", status: "done" },
  { n: 14, label: "Schedule visa appointment", date: "Mar 10", status: "current" },
  { n: 15, label: "Prepare document bundle", date: "Mar 12", status: "upcoming" },
  { n: 16, label: "Mock interview, round 1", date: "Mar 14", status: "upcoming" },
  { n: 17, label: "Pay MRV fee", date: "Mar 16", status: "upcoming" },
  { n: 18, label: "Confirm appointment letter", date: "Mar 18", status: "upcoming" },
];

export function Hero() {
  return (
    <section
      aria-label="Hero"
      className="gs-hero-root"
      style={{ position: "relative", width: "100%", background: CREAM, overflow: "hidden" }}
    >
      <div
        className="gs-hero-content"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 980,
          margin: "0 auto",
          padding: "clamp(96px, 12vh, 144px) 24px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, ease, delay: 0.15 }}
          style={{
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 11,
            color: PERSIMMON,
            textTransform: "uppercase",
            letterSpacing: "0.42em",
            fontWeight: 600,
            margin: 0,
          }}
        >
          F-1 · 47 Steps · One Payment
        </motion.p>

        {/* Headline — TextType cycling on new editorial lines */}
        <motion.h1
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease, delay: 0.3 }}
          className="gs-hero-headline"
          style={{
            fontFamily: "var(--font-display-stack)",
            fontWeight: 400,
            fontSize: "clamp(44px, 7.2vw, 84px)",
            color: INK,
            lineHeight: 1.02,
            letterSpacing: "-0.028em",
            margin: "24px 0 0",
            textAlign: "center",
            textWrap: "balance" as "balance",
            /* Reserve two lines worth of height so cycling between
               short and long phrases never reflows the page below. */
            minHeight: "2.1em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: 18 + "ch",
          }}
        >
          <TextType
            text={[
              "Forty-seven steps. We have all of them.",
              "Sequenced from I-20 to stamp.",
              "Walk in already prepared.",
            ]}
            typingSpeed={70}
            pauseDuration={1800}
            showCursor
            cursorCharacter="_"
            deletingSpeed={45}
            variableSpeedEnabled={false}
            variableSpeedMin={60}
            variableSpeedMax={120}
            cursorBlinkDuration={0.55}
            cursorStyle={{ color: PERSIMMON }}
          />
        </motion.h1>

        {/* Sub-line */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, ease, delay: 0.5 }}
          className="gs-hero-sub"
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 17,
            color: INK_SOFT,
            lineHeight: 1.55,
            maxWidth: 560,
            margin: "22px auto 0",
            letterSpacing: "-0.003em",
          }}
        >
          A 47-step playbook in consulate order. AI document checks trained on
          real refusal patterns. Voice mock interviews scored like the booth.
          One workspace until your passport is stamped.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease, delay: 0.7 }}
          className="gs-hero-ctas"
          style={{
            marginTop: 36,
            display: "flex",
            gap: 18,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/sign-up" className="gs-hero-primary">
            Start free — Phase 1 forever
          </Link>
          <Link href="#pricing" className="gs-hero-secondary">
            See the 47 steps <span aria-hidden>↓</span>
          </Link>
        </motion.div>
      </div>

      {/* ───── Cliffhanger: playbook teaser scrolling upward, masked top + bottom */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.8, ease, delay: 0.95 }}
        aria-hidden
        className="gs-hero-teaser"
      >
        <div className="gs-hero-teaser-meta">
          <span className="gs-hero-teaser-dot" />
          Phase 02 — After I-20 · live preview
        </div>
        <div className="gs-hero-teaser-frame">
          <div className="gs-hero-teaser-track">
            {[...STEPS, ...STEPS].map((s, i) => (
              <Row key={`${s.n}-${i}`} step={s} />
            ))}
          </div>
        </div>
      </motion.div>

      <style>{`
        .gs-hero-root {
          /* Pulls the StackedFeatureCards section up so the teaser bleeds
             into it — cliffhanger that actually keeps going. */
          padding-bottom: 0;
        }

        .gs-hero-primary {
          background: ${PERSIMMON};
          color: #FAF8F4;
          font-family: var(--font-sans-stack);
          font-size: 15px;
          font-weight: 600;
          padding: 16px 30px;
          border-radius: 999px;
          border: 1px solid ${PERSIMMON};
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.18) inset,
            0 10px 28px -10px rgba(232,98,42,0.55);
          transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .gs-hero-primary:hover {
            transform: translateY(-1px);
            background: #F07040;
            box-shadow:
              0 1px 0 rgba(255,255,255,0.2) inset,
              0 14px 36px -12px rgba(232,98,42,0.65);
          }
        }
        .gs-hero-primary:active { transform: translateY(0) scale(0.98); }

        .gs-hero-secondary {
          font-family: var(--font-sans-stack);
          font-size: 14px;
          font-weight: 500;
          color: ${INK_SOFT};
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 6px;
          letter-spacing: -0.003em;
          transition: color 200ms ease;
        }
        .gs-hero-secondary span { transition: transform 200ms ease; }
        @media (hover: hover) and (pointer: fine) {
          .gs-hero-secondary:hover { color: ${INK}; }
          .gs-hero-secondary:hover span { transform: translateY(2px); }
        }

        /* Cliffhanger teaser */
        .gs-hero-teaser {
          position: relative;
          margin: clamp(56px, 8vh, 96px) auto 0;
          max-width: 720px;
          padding: 0 24px;
        }
        .gs-hero-teaser-meta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 auto 14px;
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(11,30,63,0.55);
        }
        .gs-hero-teaser-dot {
          width: 6px; height: 6px; border-radius: 999px;
          background: ${PERSIMMON};
          box-shadow: 0 0 0 0 rgba(232,98,42,0.45);
          animation: gs-hero-pulse 1.8s ease-in-out infinite;
        }
        .gs-hero-teaser-frame {
          position: relative;
          height: 260px;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(11,30,63,0.08);
          background: #FFFDF7;
          box-shadow: 0 24px 48px -28px rgba(11,30,63,0.22);
          -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 18%, #000 70%, transparent 100%);
                  mask-image: linear-gradient(180deg, transparent 0%, #000 18%, #000 70%, transparent 100%);
        }
        .gs-hero-teaser-track {
          display: flex;
          flex-direction: column;
          gap: 0;
          animation: gs-hero-track 28s linear infinite;
          will-change: transform;
        }
        .gs-hero-row {
          display: grid;
          grid-template-columns: 22px 70px 1fr auto;
          align-items: center;
          gap: 14px;
          height: 56px;
          padding: 0 22px;
          border-bottom: 1px solid rgba(11,30,63,0.06);
          font-family: var(--font-sans-stack);
          font-size: 13.5px;
          color: ${INK};
        }
        .gs-hero-row-step {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 10.5px;
          letter-spacing: 0.12em;
          color: rgba(11,30,63,0.45);
        }
        .gs-hero-row-label { letter-spacing: -0.003em; }
        .gs-hero-row-label.is-current { font-weight: 500; color: ${INK}; }
        .gs-hero-row-label.is-upcoming { color: rgba(11,30,63,0.55); }
        .gs-hero-row-date {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 11px;
          color: rgba(11,30,63,0.40);
          font-variant-numeric: tabular-nums;
        }

        .gs-hero-mark {
          width: 18px; height: 18px; border-radius: 999px;
          display: inline-flex; align-items: center; justify-content: center;
          flex: 0 0 auto;
        }
        .gs-hero-mark.is-done {
          background: ${PERSIMMON};
          color: #FFF;
        }
        .gs-hero-mark.is-current {
          background: transparent;
          border: 1.5px solid ${PERSIMMON};
          position: relative;
        }
        .gs-hero-mark.is-current::after {
          content: "";
          width: 7px; height: 7px; border-radius: 999px;
          background: ${PERSIMMON};
          animation: gs-hero-pulse 1.6s ease-in-out infinite;
        }
        .gs-hero-mark.is-upcoming {
          background: transparent;
          border: 1.5px solid rgba(11,30,63,0.20);
        }
        .gs-hero-check {
          width: 10px; height: 10px;
        }

        /* Scroll cue */
        .gs-hero-scrollcue {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 36px;
          background: rgba(11,30,63,0.18);
          pointer-events: none;
          z-index: 2;
        }
        .gs-hero-scrollcue::after {
          content: "";
          position: absolute;
          left: -1.5px; top: 0;
          width: 3px; height: 8px;
          border-radius: 999px;
          background: ${PERSIMMON};
          animation: gs-hero-cue 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes gs-hero-track {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(0, -50%, 0); }
        }
        @keyframes gs-hero-cue {
          0%   { transform: translateY(0);    opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(28px); opacity: 0; }
        }
        @keyframes gs-hero-pulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.55; }
        }

        @media (max-width: 767px) {
          .gs-hero-content { padding-top: 88px !important; }
          .gs-hero-headline { font-size: clamp(34px, 9vw, 48px) !important; }
          .gs-hero-sub { font-size: 15px !important; }
          .gs-hero-ctas { flex-direction: column !important; gap: 10px !important; width: 100%; }
          .gs-hero-ctas .gs-hero-primary,
          .gs-hero-ctas .gs-hero-secondary { width: 100%; justify-content: center; }
          .gs-hero-teaser { margin-top: 48px; }
          .gs-hero-teaser-frame { height: 220px; }
          .gs-hero-row { grid-template-columns: 20px 56px 1fr auto; gap: 10px; padding: 0 16px; font-size: 12.5px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gs-hero-teaser-track { animation: none !important; }
          .gs-hero-teaser-dot { animation: none !important; }
          .gs-hero-mark.is-current::after { animation: none !important; }
          .gs-hero-scrollcue::after { animation: none !important; }
        }
      `}</style>

      <span aria-hidden className="gs-hero-scrollcue" />
    </section>
  );
}

function Row({ step }: { step: Step }) {
  return (
    <div className="gs-hero-row">
      <Mark status={step.status} />
      <span className="gs-hero-row-step">Step {step.n}</span>
      <span className={`gs-hero-row-label is-${step.status}`}>{step.label}</span>
      <span className="gs-hero-row-date">{step.date}</span>
    </div>
  );
}

function Mark({ status }: { status: StepStatus }) {
  return (
    <span className={`gs-hero-mark is-${status}`} aria-hidden>
      {status === "done" ? (
        <svg className="gs-hero-check" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2.5 6.2 L5 8.6 L9.5 3.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}
