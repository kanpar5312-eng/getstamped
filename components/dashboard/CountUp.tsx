"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts an integer up from 0 → value over `duration` ms.
 *
 * Hydration-safe: the first render (server + client) always shows `value`
 * so the HTML matches. After hydration, the useEffect resets to 0 and
 * animates up. This avoids the SSR/CSR mismatch warning that a "start at
 * zero" initial state would cause.
 *
 * If `prefers-reduced-motion` is set, we skip the animation entirely and
 * leave the value at its final number.
 */
export function CountUp({ value, duration = 700, className, suffix = "" }: Props) {
  // IMPORTANT: initial state matches what the server renders → no hydration
  // mismatch. The animation kicks in after the useEffect fires post-mount.
  const [display, setDisplay] = useState<number>(value);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      // Subsequent renders with a new `value` snap to the new value.
      setDisplay(value);
      return;
    }
    startedRef.current = true;

    if (
      typeof window === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }

    // First time: reset to 0 and animate up. Both happen after hydration,
    // so React never sees a mismatch against the SSR HTML.
    setDisplay(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(easeOut(t) * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
      {suffix}
    </span>
  );
}
