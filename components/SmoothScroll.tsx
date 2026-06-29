"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* ════════════════════════════════════════════════════════════════════════
   SmoothScroll — mounts a single Lenis instance for the whole site.
   Hooked into a RAF loop and torn down on unmount. Honours
   prefers-reduced-motion: if the user has it set, we skip Lenis entirely
   and let the browser do native scrolling.
   ═════════════════════════════════════════════════════════════════════════ */

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      // Snappier defaults — lower duration + tighter lerp =
      // less perceived lag, still smooth.
      duration: 0.85,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      lerp: 0.14,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
