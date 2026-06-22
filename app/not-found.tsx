import type { Metadata } from "next";
import Link from "next/link";

/* ════════════════════════════════════════════════════════════════════════
   404 — branded full-bleed Ink screen with a faded "404" behind the
   message. Replaces Next's default not-found.
   ═════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "Page not found — GetStamped",
};

const INK       = "#1C1917";
const PERSIMMON = "#E8622A";
const PAPER     = "#FAF8F4";

export default function NotFound() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        background: INK,
        color: PAPER,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        overflow: "hidden",
        fontFamily: "var(--font-sans-stack)",
      }}
    >
      {/* Ghost "404" behind the message */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          fontFamily: "var(--font-display-stack)",
          fontSize: "clamp(120px, 32vw, 280px)",
          color: "rgba(250,248,244,0.05)",
          fontWeight: 400,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        404
      </span>

      <div style={{ position: "relative", textAlign: "center", maxWidth: 520 }}>
        <h1
          style={{
            fontFamily: "var(--font-display-stack)",
            fontSize: "clamp(30px, 7vw, 36px)",
            color: PAPER,
            fontWeight: 400,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Page not found.
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 16,
            color: "rgba(250,248,244,0.5)",
            lineHeight: 1.5,
          }}
        >
          This URL didn&rsquo;t make it through customs.
        </p>
        <Link
          href="/"
          className="gs-btn-primary"
          style={{
            marginTop: 32,
            display: "inline-block",
            fontSize: 14,
            fontWeight: 600,
            padding: "14px 32px",
            textDecoration: "none",
          }}
        >
          Back to GetStamped →
        </Link>
      </div>
    </main>
  );
}
