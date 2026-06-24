"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";

/* ════════════════════════════════════════════════════════════════════════
   ScrollStack — wraps a sequence of <ScrollStackItem> cards so each one
   pins at the viewport top and the next one slides over it.

   The "pin + slide" effect is pure CSS:
     • Each item is position: sticky, top: 0, height: 100vh.
     • Items stack in normal flow; when the next one enters, it covers
       the previous in z-order (later siblings naturally paint on top).
   The scale-down / lift / corner-round of the underlying card is
   driven by Framer Motion useScroll inside ScrollStackItem.

   Lenis runs a global wheel-smoothing loop while this component is
   mounted. It auto-cleans up on unmount so other landing-page scroll
   hooks aren't disturbed.
   ═════════════════════════════════════════════════════════════════════════ */

type Props = {
  children: ReactNode;
  /** Optional className applied to the outer wrapper for spacing tweaks. */
  className?: string;
};

export function ScrollStack({ children, className }: Props) {
  // We attach Lenis to the body's scroll, not a custom container. That
  // keeps existing anchor/scroll behaviour on the rest of the landing
  // page working unchanged.
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // prefers-reduced-motion users get native scroll — Lenis honours
    // this automatically via its `autoRaf` option, but we double-check
    // here so we never start the rAF loop unnecessarily.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      // Apple-feel curve: deliberate but never floaty.
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch scrolls keep native momentum — Lenis only smooths wheel.
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });
    lenisRef.current = lenis;

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <section
      className={["gs-scrollstack relative w-full", className ?? ""].join(" ")}
      style={{
        // No padding/margin around the stack — each card owns its
        // background and fills the viewport edge-to-edge.
        margin: 0,
      }}
    >
      {children}
    </section>
  );
}
