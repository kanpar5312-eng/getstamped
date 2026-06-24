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

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const radius = useTransform(scrollYProgress, [0, 1], [0, 24]);

  return (
    <div
      ref={ref}
      className="gs-scrollstack-item"
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        width: "100%",
      }}
    >
      <motion.div
        className={[
          "gs-scrollstack-card relative w-full h-full overflow-hidden",
          className ?? "",
        ].join(" ")}
        style={{
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
