"use client";

import { motion, useReducedMotion } from "motion/react";
import { fadeIn, inViewOnce, slideLeft, slideRight } from "@/lib/motion";

/* ════════════════════════════════════════════════════════════════════════════
   SectionDivider — a thin 96px-tall band between major sections.
     [—————————————]  ◯ STAMP TEXT ◯  [—————————————]
   Replaces generic <hr>. Lines slide in from outside, oval fades in after.
   Background follows the next section so it never reads as a separate strip.
   ═════════════════════════════════════════════════════════════════════════ */

type Props = {
  label: string;
  bg?: "paper" | "ink";
};

export function SectionDivider({ label, bg = "paper" }: Props) {
  const reduce = useReducedMotion();

  const bgClass =
    bg === "ink"
      ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
      : "bg-[var(--color-paper)] text-[var(--color-ink)]";

  /* If reduced motion: render the final state without transitions. */
  if (reduce) {
    return <DividerMarkup label={label} bgClass={bgClass} reduced />;
  }

  return (
    <DividerMarkup label={label} bgClass={bgClass} reduced={false}>
      <motion.span
        aria-hidden
        className="block h-px flex-1 origin-right"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, currentColor 25%, currentColor 75%, transparent 100%)",
          opacity: 0.12,
        }}
        variants={slideLeft}
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
      />
      <motion.span
        className="relative inline-flex items-center justify-center"
        style={{ width: 200, height: 44 }}
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
        transition={{ delay: 0.4 }}
      >
        <Oval />
      </motion.span>
      <motion.span
        aria-hidden
        className="block h-px flex-1 origin-left"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, currentColor 25%, currentColor 75%, transparent 100%)",
          opacity: 0.12,
        }}
        variants={slideRight}
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
      />
    </DividerMarkup>
  );
}

function DividerMarkup({
  label,
  bgClass,
  reduced,
  children,
}: {
  label: string;
  bgClass: string;
  reduced: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="separator"
      aria-label={label}
      className={`${bgClass} w-full`}
      style={{ paddingTop: 32, paddingBottom: 32 }}
    >
      <div className="mx-auto flex max-w-[1240px] items-center gap-12 px-6">
        {reduced ? (
          <>
            <span aria-hidden className="block h-px flex-1" style={{ background: "currentColor", opacity: 0.1 }} />
            <span className="relative inline-flex items-center justify-center" style={{ width: 200, height: 44 }}>
              <Oval />
              <OvalLabel label={label} />
            </span>
            <span aria-hidden className="block h-px flex-1" style={{ background: "currentColor", opacity: 0.1 }} />
          </>
        ) : (
          <>
            {children}
            <OvalLabel label={label} />
          </>
        )}
      </div>
    </div>
  );
}

function Oval() {
  return (
    <svg
      viewBox="0 0 200 44"
      width="200"
      height="44"
      aria-hidden
      className="absolute inset-0"
    >
      <ellipse
        cx="100"
        cy="22"
        rx="98"
        ry="20.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.22"
      />
    </svg>
  );
}

/* The label sits absolutely inside the oval. Inter, very wide tracking,
   the kind you see on real stamped documents. */
function OvalLabel({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center font-sans"
      style={{
        fontSize: 9,
        letterSpacing: "0.45em",
        textTransform: "uppercase",
        opacity: 0.35,
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}
