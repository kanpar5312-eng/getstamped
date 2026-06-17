"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  text: string;
  /** Characters per second. ~32 reads as a deliberate, readable type-out. */
  cps?: number;
  /** Skip animation if the user prefers reduced motion. Default: true. */
  respectReducedMotion?: boolean;
  /** Renders the supplied text once typing completes — pass the markdown-rendered node. */
  renderFinal?: (text: string) => ReactNode;
  /** Fires once the typewriter reaches the end. */
  onDone?: () => void;
};

/**
 * Animates `text` onto the page character-by-character via a single
 * requestAnimationFrame loop. Once complete, swaps to the final formatted
 * render so markdown, links, etc. show properly.
 *
 * Strict-mode safe: the effect re-keys on the `text` value and always
 * restarts the RAF loop on mount. No ref-based "have I run before?" guard
 * — those silently break under React's dev-time double-invoke of effects
 * (the cleanup cancels the RAF and the second pass sees the ref set and
 * bails, so nothing types).
 */
export function TypedText({
  text,
  cps = 32,
  respectReducedMotion = true,
  renderFinal,
  onDone,
}: Props) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  // Reset visible state whenever the input text changes (different message,
  // retry, etc.). Otherwise we'd type the new content over a stale buffer.
  useEffect(() => {
    setShown("");
    setDone(false);
  }, [text]);

  useEffect(() => {
    if (!text) {
      setDone(true);
      onDone?.();
      return;
    }

    if (
      respectReducedMotion &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(text);
      setDone(true);
      onDone?.();
      return;
    }

    const chars = [...text];
    let raf = 0;
    let start = 0;
    let cancelled = false;

    const tick = (t: number) => {
      if (cancelled) return;
      if (!start) start = t;
      const elapsed = (t - start) / 1000;
      const target = Math.min(chars.length, Math.ceil(elapsed * cps));
      setShown(chars.slice(0, target).join(""));
      if (target < chars.length) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        onDone?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
    // onDone intentionally omitted — it's allowed to be a fresh function
    // each render without restarting the typewriter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, cps, respectReducedMotion]);

  if (done) {
    return <>{renderFinal ? renderFinal(text) : text}</>;
  }
  return (
    <span>
      <span style={{ whiteSpace: "pre-wrap" }}>{shown}</span>
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: "0.5em",
          height: "1em",
          marginLeft: 2,
          verticalAlign: "-2px",
          background: "currentColor",
          opacity: 0.45,
          animation: "typed-caret-blink 1s steps(1) infinite",
        }}
      />
      <style>{`
        @keyframes typed-caret-blink {
          0%, 49% { opacity: 0.45; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
