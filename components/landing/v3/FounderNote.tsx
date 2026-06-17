"use client";

import { motion, useReducedMotion } from "motion/react";
import { fadeUp, inViewOnce } from "@/lib/motion";

/* ════════════════════════════════════════════════════════════════════════════
   FounderNote — quiet beat between Reviews and FAQ.
   No stagger, no flourish. The restraint is the design.
   ═════════════════════════════════════════════════════════════════════════ */

export function FounderNote() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="From the founder"
      className="bg-[var(--color-paper)] text-[var(--color-ink)]"
      style={{ paddingTop: 120, paddingBottom: 120 }}
    >
      <motion.div
        className="mx-auto max-w-[640px] px-6"
        variants={reduce ? undefined : fadeUp}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={inViewOnce}
      >
        <p
          className="font-sans uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "var(--color-ink-soft)",
            marginBottom: 32,
          }}
        >
          From the founder
        </p>

        {/* TODO: replace with actual founder photo (use next/image, ~48x48) */}
        <div
          aria-label="Founder photo placeholder"
          className="flex items-center justify-center rounded-full"
          style={{
            width: 48,
            height: 48,
            background: "rgba(28, 27, 26, 0.08)",
            border: "2px solid rgba(28, 27, 26, 0.10)",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--color-ink-soft)" }}>P</span>
        </div>

        <div style={{ marginTop: 16 }}>
          <p
            className="font-sans"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-ink)",
            }}
          >
            Parneet
          </p>
          <p
            className="font-sans"
            style={{
              fontSize: 12,
              color: "var(--color-ink-soft)",
              lineHeight: 1.5,
              marginTop: 2,
              maxWidth: 460,
            }}
          >
            Built this after watching friends fail their visa interview because no
            one told them what to expect.
          </p>
        </div>

        <div
          className="font-display"
          style={{
            marginTop: 32,
            fontSize: 22,
            lineHeight: 1.65,
            color: "var(--color-ink)",
            maxWidth: 580,
          }}
        >
          <p>
            The F-1 process isn&rsquo;t hard. It&rsquo;s just badly explained.
            Every form exists somewhere on a government website. Every deadline
            is technically public. But nobody sequences it for you, nobody tells
            you which mistake ends your application, and nobody practices the
            interview with you at 11pm the night before.
          </p>
          <p style={{ marginTop: 18 }}>
            I built GetStamped because the information gap is artificial. It
            shouldn&rsquo;t cost you a visa.
          </p>
        </div>

        <hr
          aria-hidden
          style={{
            border: 0,
            borderTop: "1px solid rgba(28, 27, 26, 0.10)",
            marginTop: 24,
          }}
        />
        <p
          className="font-sans italic"
          style={{
            fontSize: 13,
            color: "var(--color-ink-soft)",
            marginTop: 16,
          }}
        >
          — Parneet, founder
        </p>
      </motion.div>
    </section>
  );
}
