import Link from "next/link";
import { Eyebrow } from "./primitives/Eyebrow";

export function StampedCloser() {
  return (
    <section id="closer" className="v3-section v3-closer">
      <span className="v3-closer-glow" aria-hidden />
      <span className="v3-closer-rule" aria-hidden />
      <Eyebrow className="v3-text-center">Stamped.</Eyebrow>
      <h2 className="v3-h1-closer">
        Take the <span className="v3-italic v3-persimmon">stamped</span> way.
      </h2>
      <p className="v3-lead v3-text-center v3-mx-auto v3-max-reading v3-mt-6">
        Forty-seven steps. Phase 1 free forever. Upgrade only when you hit
        Phase 2.
      </p>
      <div
        className="v3-closer-image"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ApprovedStamp />
      </div>
      <div className="v3-closer-ctas">
        <Link href="/sign-up" className="v3-pill">Start free</Link>
        <Link href="#pricing" className="v3-ghost">See pricing</Link>
      </div>
    </section>
  );
}

/* A visa-style APPROVED stamp — same oval+wide-tracked-text language as
   the SectionDivider stamp, just blown up and Persimmon-coloured so it
   anchors the final CTA. Pure SVG; respects reduced motion (no animation). */
function ApprovedStamp() {
  return (
    <svg
      viewBox="0 0 360 220"
      width="360"
      height="220"
      role="img"
      aria-label="APPROVED stamp"
      style={{
        color: "var(--color-forest)",
        display: "block",
        maxWidth: "100%",
        height: "auto",
        transform: "rotate(-6deg)",
      }}
    >
      {/* Outer oval */}
      <ellipse
        cx="180"
        cy="110"
        rx="170"
        ry="92"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.85"
      />
      {/* Inner oval */}
      <ellipse
        cx="180"
        cy="110"
        rx="156"
        ry="80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.65"
      />
      {/* Top arc label */}
      <text
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="11"
        letterSpacing="6"
        fontWeight="600"
        fill="currentColor"
        opacity="0.7"
      >
        <textPath href="#stamp-arc-top" startOffset="50%" textAnchor="middle">
          U.S. CONSULATE · F-1 STUDENT VISA
        </textPath>
      </text>
      <path
        id="stamp-arc-top"
        d="M 30 110 a 150 78 0 0 1 300 0"
        fill="none"
      />
      {/* Main word */}
      <text
        x="180"
        y="118"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="44"
        letterSpacing="8"
        fontWeight="700"
        fill="currentColor"
      >
        APPROVED
      </text>
      {/* Bottom date line */}
      <text
        x="180"
        y="160"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="12"
        letterSpacing="5"
        fontWeight="500"
        fill="currentColor"
        opacity="0.75"
      >
        FOR ENTRY · MULTIPLE
      </text>
    </svg>
  );
}
