"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/* ════════════════════════════════════════════════════════════════════════
   ScrollStackItem — one card in the stack.
     • position: sticky pins the card at the viewport top.
     • As the user scrolls past this card's spacer, useScroll's progress
       0 → 1 drives a subtle scale-down + lift + top-corner-round so the
       previous card "tucks under" the next.
   ═════════════════════════════════════════════════════════════════════════ */

type Props = {
  children: ReactNode;
  /** Tailwind class for the card's background — passed directly. */
  className?: string;
  /** Optional inline style override for the card surface. */
  style?: React.CSSProperties;
};

export function ScrollStackItem({ children, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Track the spacer's scroll position from "just before it enters the
  // top of the viewport" (start "end end") to "fully scrolled past"
  // (end "end start"). Progress 0 = card just pinned; 1 = next card
  // has fully covered this one.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "end start"],
  });

  // Aggressive lift + shrink so when the next card slides over, the
  // previous card's top edge peeks above the new one — that's the
  // "visible deck" stack effect (multiple cards layered with corners
  // showing) instead of a single full-bleed replace.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -64]);
  const radius = useTransform(scrollYProgress, [0, 1], [24, 28]);

  return (
    <div
      ref={ref}
      className="gs-scrollstack-item"
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5vh 16px",
      }}
    >
      <motion.div
        className={[
          "gs-scrollstack-card relative w-full overflow-hidden",
          className ?? "",
        ].join(" ")}
        style={{
          // Card surface is shorter than the viewport so previous
          // cards have room to peek above when they translate up.
          height: "min(80vh, 760px)",
          maxWidth: 1240,
          margin: "0 auto",
          borderRadius: 24,
          boxShadow:
            "0 32px 80px -40px rgba(11,30,63,0.35), 0 12px 28px -16px rgba(11,30,63,0.18)",
          scale,
          y,
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          // Force GPU compositing so the scale/translate stays smooth
          // when stacked over other transformed elements.
          willChange: "transform, border-radius",
          ...style,
        }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
