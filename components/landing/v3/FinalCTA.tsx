"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

/* ════════════════════════════════════════════════════════════════════════════
   FinalCTA — last beat before the footer.
   Dark ink section. Three elements only: headline, subhead, button.
   Different visual language from StampedCloser (which uses the passport
   metaphor). No stamps, no images — flat color, single button.
   ═════════════════════════════════════════════════════════════════════════ */

export function FinalCTA() {
  const reduce = useReducedMotion();

  const onScrollToCycle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("feature-cycle");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      aria-label="Get started"
      className="bg-[var(--color-ink)] text-[var(--color-paper)]"
      style={{ paddingTop: 160, paddingBottom: 160 }}
    >
      <motion.div
        className="mx-auto max-w-[720px] px-6 text-center"
        variants={reduce ? undefined : staggerContainer}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={inViewOnce}
      >
        <motion.h2
          variants={reduce ? undefined : fadeUp}
          className="font-display"
          style={{
            fontSize: "clamp(40px, 6vw, 64px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            color: "var(--color-paper)",
          }}
        >
          Start your 47 steps today.
        </motion.h2>

        <motion.p
          variants={reduce ? undefined : fadeUp}
          className="mx-auto font-sans"
          style={{
            fontSize: 16,
            color: "rgba(245, 239, 230, 0.5)",
            marginTop: 16,
            maxWidth: 480,
          }}
        >
          Free to start. Takes 60 seconds.
        </motion.p>

        <motion.div
          variants={
            reduce
              ? undefined
              : {
                  hidden: { opacity: 0, y: 32, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }
          }
          className="mt-8"
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center font-sans"
            style={{
              background: "var(--color-persimmon)",
              color: "var(--color-paper)",
              fontSize: 15,
              fontWeight: 600,
              padding: "16px 40px",
              borderRadius: 8,
              transition: "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget;
              t.style.background = "#F07040";
              t.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget;
              t.style.background = "var(--color-persimmon)";
              t.style.transform = "scale(1)";
            }}
          >
            Get Stamped →
          </Link>
        </motion.div>

        <motion.div
          variants={reduce ? undefined : fadeUp}
          className="mt-4"
        >
          <a
            href="#feature-cycle"
            onClick={onScrollToCycle}
            className="font-sans"
            style={{
              fontSize: 13,
              color: "rgba(245, 239, 230, 0.35)",
              textDecoration: "none",
              transition: "color 200ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(245, 239, 230, 0.6)";
              e.currentTarget.style.textDecoration = "underline";
              e.currentTarget.style.textUnderlineOffset = "3px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(245, 239, 230, 0.35)";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            See how it works ↓
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
