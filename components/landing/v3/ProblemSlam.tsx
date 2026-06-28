"use client";

import { motion, useReducedMotion } from "motion/react";
import { fadeUp, inViewOnce, slideLeft, staggerContainer } from "@/lib/motion";

/* ════════════════════════════════════════════════════════════════════════════
   ProblemSlam — reset emotional state before Pricing.
   Layout uses inline styles so centering + sizing don't depend on Tailwind
   arbitrary-value compilation. Container max-width 760px, centered on the
   page. Pain rows are horizontally constrained to that column, NOT page-wide.
   ═════════════════════════════════════════════════════════════════════════ */

const PAINS = [
  "You miss the SEVIS deadline because nobody told you it was first.",
  "Your DS-160 has a typo. You don't know until you're sitting in the chair.",
  "Your parents call every night. You don't have answers.",
  "You walk in unprepared. The officer can tell.",
];

const COLUMN_W = 760;

export function ProblemSlam() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Without GetStamped"
      style={{
        background: "var(--color-nocturnal)",
        color: "var(--color-paper)",
        paddingTop: 140,
        paddingBottom: 100,
      }}
    >
      {/* Centered column. width:100% + maxWidth + margin auto guarantees
          centering regardless of Tailwind. */}
      <div
        style={{
          width: "100%",
          maxWidth: COLUMN_W,
          margin: "0 auto",
          paddingLeft: 24,
          paddingRight: 24,
          textAlign: "center",
        }}
      >
        {/* Eyebrow — centered */}
        <motion.p
          variants={reduce ? undefined : fadeUp}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "visible"}
          viewport={inViewOnce}
          style={{
            margin: 0,
            fontFamily: "var(--font-sans-stack)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--color-persimmon)",
          }}
        >
          Without GetStamped
        </motion.p>

        {/* Pain list — left-aligned text inside the centered column */}
        <motion.ul
          variants={reduce ? undefined : staggerContainer}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "visible"}
          viewport={inViewOnce}
          style={{
            listStyle: "none",
            padding: 0,
            margin: "44px 0 0",
            textAlign: "left",
          }}
        >
          {PAINS.map((p) => (
            <motion.li
              key={p}
              variants={reduce ? undefined : slideLeft}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                paddingTop: 7,
                paddingBottom: 7,
                borderBottom: "1px solid rgba(245, 239, 230, 0.10)",
              }}
            >
              <span
                aria-hidden
                style={{
                  flex: "0 0 auto",
                  color: "var(--color-persimmon)",
                  opacity: 0.55,
                  fontSize: 17,
                  lineHeight: 1,
                }}
              >
                ×
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans-stack)",
                  fontSize: 17,
                  lineHeight: 1.5,
                  letterSpacing: "-0.005em",
                  color: "rgba(245, 239, 230, 0.85)",
                }}
              >
                {p}
              </span>
            </motion.li>
          ))}
        </motion.ul>

        {/* Pivot — centered serif */}
        <motion.p
          variants={reduce ? undefined : fadeUp}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "visible"}
          viewport={inViewOnce}
          transition={{ delay: 0.55 }}
          style={{
            margin: "56px auto 0",
            maxWidth: 560,
            fontFamily: "var(--font-display-stack)",
            fontSize: "clamp(28px, 4vw, 38px)",
            lineHeight: 1.2,
            letterSpacing: "-0.018em",
            color: "var(--color-paper)",
            textAlign: "center",
          }}
        >
          Every one of those is a solved problem.
        </motion.p>

        {/* The stamp slam */}
        <StampSlam reduce={!!reduce} />

        <p
          style={{
            marginTop: 22,
            fontFamily: "var(--font-sans-stack)",
            fontSize: 13,
            color: "rgba(245, 239, 230, 0.5)",
            letterSpacing: "0.01em",
            textAlign: "center",
          }}
        >
          47 steps. Yours in under 60 seconds.
        </p>
      </div>
    </section>
  );
}

function StampSlam({ reduce }: { reduce: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        width: 200,
        height: 200,
        margin: "44px auto 0",
      }}
    >
      {/* Ink-spread shockwave */}
      <motion.span
        aria-hidden
        initial={reduce ? false : { opacity: 0, scale: 0 }}
        whileInView={
          reduce ? undefined : { opacity: [0, 0.4, 0], scale: [0, 1.6, 2.2] }
        }
        viewport={inViewOnce}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "rgba(255, 91, 46, 0.15)",
          filter: "blur(8px)",
        }}
      />

      {/* The stamp */}
      <motion.div
        aria-hidden
        initial={reduce ? false : { opacity: 0, scale: 2.5, rotate: -15 }}
        whileInView={
          reduce
            ? undefined
            : { opacity: 1, scale: [2.5, 1, 1.05, 1], rotate: -8 }
        }
        viewport={inViewOnce}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.4,
          scale: { times: [0, 0.7, 0.85, 1], duration: 0.75 },
        }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stamp />
      </motion.div>
    </div>
  );
}

function Stamp() {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200" aria-hidden>
      <circle
        cx="100"
        cy="100"
        r="96"
        fill="none"
        stroke="var(--color-persimmon)"
        strokeWidth="3"
        strokeDasharray="8 4"
      />
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="var(--color-persimmon)"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
      <line
        x1="6"
        y1="100"
        x2="194"
        y2="100"
        stroke="var(--color-persimmon)"
        strokeOpacity="0.2"
        strokeWidth="1"
      />
      <text
        x="100"
        y="92"
        textAnchor="middle"
        fontFamily="var(--font-sans-stack)"
        fontSize="22"
        fontWeight="700"
        letterSpacing="6"
        fill="var(--color-persimmon)"
      >
        APPROVED
      </text>
      <text
        x="100"
        y="124"
        textAnchor="middle"
        fontFamily="var(--font-sans-stack)"
        fontSize="9"
        fontWeight="600"
        letterSpacing="4"
        fillOpacity="0.6"
        fill="var(--color-persimmon)"
      >
        F-1 VISA
      </text>
    </svg>
  );
}
