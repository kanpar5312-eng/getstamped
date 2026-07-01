type Props = {
  /** Pixel size of the rendered mark (square). */
  size?: number;
  /** Tailwind / arbitrary classes (e.g. for color overrides via text-[...]). */
  className?: string;
  /** Alt text — keep short. Defaults to brand wordmark "GetStamped". */
  alt?: string;
  /** Accepted for API compatibility with the old next/image version; unused
   *  now that the mark is inline (no separate resource load to prioritize). */
  priority?: boolean;
};

/**
 * GetStamped brand mark — arch + rising arrow.
 *
 * Rendered as inline SVG (not next/image) so `stroke="currentColor"` can
 * actually inherit the `color` of its wrapping element. Loading the SVG
 * via next/image renders it as an external <img> resource, which breaks
 * currentColor entirely — the mark rendered a fixed dark stroke regardless
 * of light/dark mode or the wrapper's text-color class, going invisible on
 * dark badge backgrounds.
 *
 * Wrap in a color utility on the parent (e.g. `text-[var(--color-ink)]`)
 * and it adapts to light/dark surfaces without prop drilling.
 */
export function BrandMark({
  size = 24,
  className = "",
  alt = "GetStamped",
}: Props) {
  const height = Math.round(size * (100 / 120));
  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth={9}
      strokeLinecap="square"
      strokeLinejoin="miter"
      role="img"
      aria-label={alt}
      className={className}
    >
      <path d="M 8 90 L 38 90 M 23 90 L 23 55" />
      <path d="M 23 55 Q 23 27 50 27 Q 77 27 77 55" />
      <path d="M 77 55 L 77 90 M 62 90 L 92 90" />
      <path d="M 23 90 L 105 22" />
      <path d="M 82 14 L 110 14 L 110 42" />
    </svg>
  );
}
