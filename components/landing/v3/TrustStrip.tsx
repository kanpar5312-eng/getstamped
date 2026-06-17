"use client";

import { motion, useReducedMotion } from "motion/react";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

/* ════════════════════════════════════════════════════════════════════════════
   TrustStrip — single 80px band, post-hero authority transfer.
   Inline styles for layout so the strip centers + spaces correctly without
   relying on Tailwind arbitrary-value compilation.
   ═════════════════════════════════════════════════════════════════════════ */

const STATS = [
  { value: "2,847", label: "students stamped" },
  { value: "96%", label: "visa approval rate" },
  { value: "47", label: "steps. nothing skipped." },
];

export function TrustStrip() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Trust"
      style={{
        background: "var(--color-paper)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <motion.div
        style={{
          width: "100%",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "20px 24px",
          minHeight: 80,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 32,
        }}
        variants={reduce ? undefined : staggerContainer}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={inViewOnce}
      >
        {/* Stats — left group, flex-grow so they spread evenly when alone */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            flex: 1,
            minWidth: 280,
          }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={reduce ? undefined : fadeUp}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display-stack)",
                    fontSize: 22,
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--color-ink)",
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    marginTop: 2,
                    fontFamily: "var(--font-sans-stack)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--color-ink-soft)",
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < STATS.length - 1 ? (
                <span
                  aria-hidden
                  style={{
                    margin: "0 24px",
                    width: 1,
                    height: 36,
                    background: "var(--color-ink)",
                    opacity: 0.12,
                  }}
                />
              ) : null}
            </motion.div>
          ))}
        </div>

        {/* University placeholders — right group, hidden under 880px */}
        <div
          className="trust-logos"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              aria-label="University partner placeholder"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 116,
                height: 28,
                borderRadius: 4,
                background: "rgba(28, 27, 26, 0.06)",
                fontFamily: "var(--font-sans-stack)",
                fontSize: 9,
                color: "var(--color-ink-soft)",
                letterSpacing: "0.06em",
              }}
            >
              University Partner
            </div>
          ))}
        </div>
      </motion.div>

      {/* Hide logos on narrow viewports — scoped <style> avoids needing to
          edit the project's Styles.tsx for one media query. */}
      <style>{`@media (max-width: 880px) { .trust-logos { display: none !important; } }`}</style>
    </section>
  );
}
