import Image from "next/image";

type Props = {
  /** Pixel size of the rendered mark (square). */
  size?: number;
  /** Tailwind / arbitrary classes (e.g. for color overrides via [&_path]:stroke-…). */
  className?: string;
  /** Alt text — keep short. Defaults to brand wordmark "GetStamped". */
  alt?: string;
  /** Set true on hero / large display so Next loads at higher priority. */
  priority?: boolean;
};

/**
 * GetStamped brand mark — arch + rising arrow.
 *
 * Source of truth: /public/logo.svg (currentColor strokes, scales crisply).
 * Once you drop the high-fidelity raster at /public/logo.png, swap the
 * `src` constant below to `/logo.png` — every consumer picks it up.
 *
 * The mark inherits color via `currentColor` in the SVG, so wrap in a
 * color utility on the parent (e.g. `text-[var(--color-ink)]`) and it
 * adapts to light/dark surfaces without prop drilling.
 */
const SRC = "/logo.svg";

export function BrandMark({
  size = 24,
  className = "",
  alt = "GetStamped",
  priority = false,
}: Props) {
  return (
    <Image
      src={SRC}
      alt={alt}
      width={size}
      height={Math.round(size * (100 / 120))}
      priority={priority}
      className={className}
    />
  );
}
