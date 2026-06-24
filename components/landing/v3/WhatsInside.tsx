"use client";

import MagicBento from "@/components/ui/MagicBento";

/* ════════════════════════════════════════════════════════════════════════
   WhatsInside — six product pillars rendered as a MagicBento grid.
   Spotlight + particle + border-glow animation is the React Bits
   default; only the palette (Persimmon over Ink) is brand-swapped.
   ═════════════════════════════════════════════════════════════════════════ */

export function WhatsInside() {
  return (
    <section
      style={{
        position: "relative",
        padding: "80px 24px",
        background: "var(--color-paper)",
      }}
    >
      <p
        style={{
          textAlign: "center",
          paddingBottom: 32,
          fontSize: 10,
          color: "#E8622A",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          fontFamily: "var(--font-sans-stack)",
          fontWeight: 600,
          margin: 0,
        }}
      >
        What&rsquo;s Inside
      </p>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <MagicBento
          textAutoHide
          enableStars
          enableSpotlight
          enableBorderGlow
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="232, 98, 42"
          disableAnimations={false}
        />
      </div>
    </section>
  );
}
