/**
 * Three classical columns rendered as a stippled SVG.
 * Inherits color from parent via currentColor so it adapts to light/dark.
 *
 * Algorithm: each column is built by drawing tiny dots along the silhouette
 * of capital + shaft + base, with a few interior dots for texture.
 */

type DotProps = { cx: number; cy: number; r?: number; o?: number };

function dot({ cx, cy, r = 0.9, o = 0.85 }: DotProps) {
  return <circle key={`${cx}-${cy}-${r}`} cx={cx} cy={cy} r={r} opacity={o} />;
}

// Pseudo-random but deterministic jitter so the same column renders the same
// dots on every server + client render (no hydration mismatch).
function jitter(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s); // 0..1
}

function buildColumn(cx: number, top: number, bottom: number): React.ReactNode[] {
  const dots: React.ReactNode[] = [];
  const shaftWidth = 28;
  const capWidth = 56;
  const baseWidth = 64;
  const capHeight = 50;
  const baseHeight = 36;
  const shaftTop = top + capHeight;
  const shaftBottom = bottom - baseHeight;

  // ---------- Capital (top) ----------
  // Outline: trapezoid widening upward
  for (let y = top; y < shaftTop; y += 3) {
    const t = (y - top) / capHeight;
    const w = shaftWidth + (capWidth - shaftWidth) * (1 - t);
    // outline left + right
    dots.push(dot({ cx: cx - w, cy: y, r: 1.1 }));
    dots.push(dot({ cx: cx + w, cy: y, r: 1.1 }));
    // interior speckles
    if (y < top + 18) {
      const stippleCount = Math.floor(w / 4);
      for (let i = 0; i < stippleCount; i++) {
        const xj = (jitter(y * 31 + i * 7) - 0.5) * w * 1.6;
        dots.push(dot({ cx: cx + xj, cy: y + (jitter(y * 17 + i) * 2 - 1), r: 0.6, o: 0.55 }));
      }
    }
  }
  // Capital top cap (decorative scrolls)
  for (let i = -2; i <= 2; i++) {
    dots.push(dot({ cx: cx + i * 14, cy: top - 4, r: 1.6, o: 0.9 }));
  }
  // Abacus (square slab on top of capital)
  for (let x = cx - capWidth - 4; x <= cx + capWidth + 4; x += 3) {
    dots.push(dot({ cx: x, cy: top + 6, r: 1.0 }));
    dots.push(dot({ cx: x, cy: top + 10, r: 1.0 }));
  }

  // ---------- Shaft (vertical fluting) ----------
  // Outline + 6 vertical flute lines made of dots
  const fluteOffsets = [-12, -8, -4, 0, 4, 8, 12];
  for (let y = shaftTop; y < shaftBottom; y += 4) {
    // outer outline
    dots.push(dot({ cx: cx - shaftWidth, cy: y, r: 1.1 }));
    dots.push(dot({ cx: cx + shaftWidth, cy: y, r: 1.1 }));
    // flutes (thinner, more transparent)
    for (const fx of fluteOffsets) {
      dots.push(dot({ cx: cx + fx, cy: y, r: 0.5, o: 0.35 }));
    }
  }
  // Light cross banding for texture
  for (let y = shaftTop + 40; y < shaftBottom; y += 80) {
    for (let x = cx - shaftWidth + 2; x < cx + shaftWidth; x += 3) {
      dots.push(dot({ cx: x, cy: y, r: 0.6, o: 0.5 }));
    }
  }

  // ---------- Base ----------
  for (let y = shaftBottom; y <= bottom; y += 3) {
    const t = (y - shaftBottom) / baseHeight;
    const w = shaftWidth + (baseWidth - shaftWidth) * t;
    dots.push(dot({ cx: cx - w, cy: y, r: 1.1 }));
    dots.push(dot({ cx: cx + w, cy: y, r: 1.1 }));
  }
  // Bottom plinth
  for (let x = cx - baseWidth - 6; x <= cx + baseWidth + 6; x += 3) {
    dots.push(dot({ cx: x, cy: bottom + 4, r: 1.0 }));
    dots.push(dot({ cx: x, cy: bottom + 8, r: 1.0 }));
  }

  // ---------- Ground line (subtle) ----------
  for (let x = cx - baseWidth - 12; x <= cx + baseWidth + 12; x += 5) {
    dots.push(dot({ cx: x, cy: bottom + 16, r: 0.5, o: 0.3 }));
  }

  return dots;
}

export function ColumnsArt({ className = "" }: { className?: string }) {
  // Three columns at progressively offset heights for a sense of perspective
  const columns = [
    { cx: 140, top: 50, bottom: 720 },
    { cx: 330, top: 90, bottom: 680 },
    { cx: 520, top: 30, bottom: 740 },
  ];

  return (
    <svg
      viewBox="0 0 660 800"
      preserveAspectRatio="xMidYMid meet"
      className={`text-current ${className}`}
      fill="currentColor"
      aria-hidden
    >
      {columns.map((c, i) => (
        <g key={i}>{buildColumn(c.cx, c.top, c.bottom)}</g>
      ))}
    </svg>
  );
}
