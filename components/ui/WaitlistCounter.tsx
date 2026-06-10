"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  claimed: number;
  total?: number;
};

/**
 * Inline counter: "$9 lifetime for first 100 signups · [N] of 100 claimed"
 * Animates only the digit roll when `claimed` changes.
 */
export function WaitlistCounter({ claimed, total = 100 }: Props) {
  const [display, setDisplay] = useState(claimed);
  const prev = useRef(claimed);

  useEffect(() => {
    if (claimed === prev.current) return;
    const from = prev.current;
    const to = claimed;
    const start = performance.now();
    const duration = 400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [claimed]);

  const soldOut = claimed >= total;

  return (
    <p className="text-xs text-[var(--color-muted)] leading-relaxed">
      {soldOut ? (
        <>
          <span className="font-mono text-[var(--color-ink)]">$19</span>{" "}
          lifetime · early bird sold out
        </>
      ) : (
        <>
          <span className="font-mono text-[var(--color-ink)]">$9</span> lifetime
          access for the first 100 signups
          <span className="mx-2 text-[var(--color-border)]">·</span>
          <span className="font-mono tabular-nums text-[var(--color-ink)]">
            {display}
          </span>
          <span> of {total} claimed</span>
        </>
      )}
    </p>
  );
}
