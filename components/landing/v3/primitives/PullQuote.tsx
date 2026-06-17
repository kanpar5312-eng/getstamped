import type { ReactNode } from "react";

export function PullQuote({
  children,
  attribution,
  className = "",
}: {
  children: ReactNode;
  attribution?: string;
  className?: string;
}) {
  return (
    <figure className={`max-w-[40ch] ${className}`}>
      <blockquote
        className="text-[var(--color-ink-soft)] italic"
        style={{
          fontFamily: "var(--font-display-stack)",
          fontSize: "clamp(20px, 2.2vw, 26px)",
          lineHeight: 1.35,
          hangingPunctuation: "first last",
        }}
      >
        &ldquo;{children}&rdquo;
      </blockquote>
      {attribution ? (
        <figcaption
          className="mt-3 text-[12.5px] text-[var(--color-muted)] uppercase tracking-[0.12em]"
          style={{ fontFamily: "var(--font-mono-stack)" }}
        >
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
