"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/* ════════════════════════════════════════════════════════════════════════
   FlowingMenu — full-width hover-revealing menu rows. Per item:
     • a marquee strip slides in from the left with the item name
       repeating across a persimmon bar
     • a circular image follows the mouse cursor within the row,
       scaling from 0 → 1 on enter and back on leave
   All animation routed through GSAP (quickTo for the cursor-follow,
   timelines for marquee + scale).
   ═════════════════════════════════════════════════════════════════════════ */

export type FlowingMenuItem = {
  link: string;
  text: string;
  image: string;
};

type Props = {
  items: FlowingMenuItem[];
  /** Higher = slower marquee. Maps to seconds per loop. */
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
};

export default function FlowingMenu({
  items,
  speed = 15,
  textColor = "#FAF8F4",
  bgColor = "#1C1917",
  marqueeBgColor = "#E8622A",
  marqueeTextColor = "#FAF8F4",
  borderColor = "rgba(250,248,244,0.10)",
}: Props) {
  return (
    <nav
      aria-label="Feature menu"
      className="gs-flowing-menu"
      style={{
        background: bgColor,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {items.map((it, i) => (
        <FlowingMenuRow
          key={it.link + i}
          item={it}
          speed={speed}
          textColor={textColor}
          marqueeBgColor={marqueeBgColor}
          marqueeTextColor={marqueeTextColor}
          borderColor={borderColor}
          isLast={i === items.length - 1}
        />
      ))}

      <style>{`
        @media (max-width: 768px) {
          .gs-flowing-menu .gs-flow-row { height: 88px !important; padding: 0 24px !important; }
          .gs-flowing-menu .gs-flow-text { font-size: clamp(1.5rem, 6vw, 2.5rem) !important; }
          .gs-flowing-menu .gs-flow-image { width: 140px !important; height: 140px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-flowing-menu .gs-flow-marquee { animation: none !important; }
        }
      `}</style>
    </nav>
  );
}

function FlowingMenuRow({
  item,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isLast,
}: {
  item: FlowingMenuItem;
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
  isLast: boolean;
}) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // quickTo getters — set once on mount so the mousemove handler stays
  // light. GSAP interpolates with the configured ease/duration.
  const xToRef = useRef<gsap.QuickToFunc | null>(null);
  const yToRef = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    if (!imageRef.current) return;
    xToRef.current = gsap.quickTo(imageRef.current, "x", { duration: 0.6, ease: "power3" });
    yToRef.current = gsap.quickTo(imageRef.current, "y", { duration: 0.6, ease: "power3" });
  }, []);

  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const row = rowRef.current;
    if (!row) return;
    const rect = row.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Snap image to cursor position before reveal so it scales up from
    // the correct anchor, not from (0,0).
    gsap.set(imageRef.current, { x, y });
    if (imageRef.current) {
      gsap.to(imageRef.current, { scale: 1, duration: 0.5, ease: "power3.out" });
    }
    if (marqueeRef.current) {
      gsap.fromTo(
        marqueeRef.current,
        { xPercent: -100 },
        { xPercent: 0, duration: 0.6, ease: "power3.out" },
      );
    }
  };

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const row = rowRef.current;
    if (!row) return;
    const rect = row.getBoundingClientRect();
    xToRef.current?.(e.clientX - rect.left);
    yToRef.current?.(e.clientY - rect.top);
  };

  const onLeave = () => {
    if (imageRef.current) {
      gsap.to(imageRef.current, { scale: 0, duration: 0.4, ease: "power3.in" });
    }
    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, { xPercent: 100, duration: 0.5, ease: "power3.in" });
    }
  };

  // Marquee text: repeat the item name 8 times with diamond separators
  // so the strip looks dense regardless of word length.
  const marqueeText = Array.from({ length: 8 })
    .map(() => item.text)
    .join(" ◆ ");

  return (
    <a
      ref={rowRef}
      href={item.link}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="gs-flow-row"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: 120,
        padding: "0 48px",
        borderBottom: isLast ? "none" : `0.5px solid ${borderColor}`,
        overflow: "hidden",
        textDecoration: "none",
        color: textColor,
      }}
    >
      {/* Marquee strip — hidden offscreen until hover */}
      <div
        ref={marqueeRef}
        aria-hidden
        className="gs-flow-marquee"
        style={{
          position: "absolute",
          inset: 0,
          background: marqueeBgColor,
          color: marqueeTextColor,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          transform: "translateX(-100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <div
          className="gs-flow-marquee-track"
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-display-stack)",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
            animation: `gs-flow-scroll ${speed}s linear infinite`,
          }}
        >
          <span style={{ paddingRight: 48 }}>{marqueeText}</span>
          <span aria-hidden style={{ paddingRight: 48 }}>
            {marqueeText}
          </span>
        </div>
      </div>

      {/* Resting label — shown when marquee is offscreen */}
      <span
        className="gs-flow-text"
        style={{
          position: "relative",
          zIndex: 0,
          fontFamily: "var(--font-display-stack)",
          fontSize: "clamp(2rem, 5vw, 4rem)",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
          color: textColor,
        }}
      >
        {item.text}
      </span>

      {/* Mouse-follower image — scales from 0 on hover. translate(-50%,
          -50%) centers the circle on the cursor; GSAP drives x/y on top. */}
      <div
        ref={imageRef}
        aria-hidden
        className="gs-flow-image"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 200,
          height: 200,
          borderRadius: "50%",
          backgroundImage: `url(${item.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          pointerEvents: "none",
          zIndex: 2,
          transform: "translate(-50%, -50%) scale(0)",
          willChange: "transform",
        }}
      />

      <style>{`
        @keyframes gs-flow-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </a>
  );
}
