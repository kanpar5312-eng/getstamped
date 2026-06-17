import type { Variants } from "motion/react";

/* ════════════════════════════════════════════════════════════════════════════
   Shared Framer Motion variants. Imported by every new landing section so
   the easing/duration vocabulary stays consistent across the page.
   Strong ease-out (0.22, 1, 0.36, 1) matches the rest of v3.
   ═════════════════════════════════════════════════════════════════════════ */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/* Standard useInView config — once true, kept out of viewport, 80px margin
   so the animation fires slightly before the section reaches the fold. */
export const inViewOnce = { once: true, margin: "-80px" } as const;
