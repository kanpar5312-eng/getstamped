"use client";

import { type ReactNode } from "react";

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
  // Lenis was previously mounted here to globally smooth wheel scroll,
  // but on long landing pages with multiple sticky stack items it
  // interfered with native scroll past the stack on macOS Safari/Chrome
  // (the page felt "stuck" near the Pricing section because Lenis's
  // computed end-of-page lagged behind the real one).
  //
  // The pin-and-tuck visual is pure CSS sticky + Framer Motion useScroll
  // inside <ScrollStackItem/>, so removing Lenis costs nothing visually
  // and restores native trackpad/wheel momentum across the whole page.
  // Re-introduce Lenis later as an opt-in `smooth` prop if needed.

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
