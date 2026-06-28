"use client";

import { motion } from "motion/react";

/* ════════════════════════════════════════════════════════════════════════
   HowItWorks — three numbered steps in Wavly's standard layout.
   ═════════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    n: 1,
    title: "Sign up free",
    body: "Phase 1 unlocks immediately. No card needed.",
  },
  {
    n: 2,
    title: "Follow the 47 steps",
    body:
      "Every form, fee and deadline — in the exact order the consulate expects.",
  },
  {
    n: 3,
    title: "Walk in prepared",
    body:
      "AI-checked documents. Mock interview done. Parents updated. You're ready.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-label="How it works"
      style={{
        background: "var(--color-cream)",
        color: "var(--color-ink)",
        padding: "96px 20px",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "var(--color-forest)",
              margin: 0,
              fontWeight: 700,
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display-stack)",
              fontWeight: 400,
              fontSize: "clamp(2rem, 4.4vw, 3rem)",
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              margin: "14px 0 0 0",
              textWrap: "balance" as "balance",
            }}
          >
            Start in 60 seconds.{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "var(--color-forest)",
                fontFamily: "inherit",
              }}
            >
              Finish stamped.
            </em>
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--color-ink-soft)",
              margin: "18px auto 0",
              maxWidth: 560,
            }}
          >
            No consultant needed. No guesswork. Just follow the steps.
          </p>
        </div>

        <div
          className="gs-how grid gap-8"
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "1fr",
          }}
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              style={{ textAlign: "center" }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 72,
                  height: 72,
                  borderRadius: 999,
                  background: "var(--color-cream-soft)",
                  border: "2px solid var(--color-forest)",
                  color: "var(--color-forest)",
                  fontFamily: "var(--font-display-stack)",
                  fontSize: 28,
                  marginBottom: 18,
                }}
              >
                {s.n}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display-stack)",
                  fontWeight: 400,
                  fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
                  letterSpacing: "-0.01em",
                  margin: 0,
                  color: "var(--color-ink)",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  marginTop: 10,
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "var(--color-ink-soft)",
                  maxWidth: 320,
                  marginInline: "auto",
                }}
              >
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .gs-how { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </section>
  );
}
