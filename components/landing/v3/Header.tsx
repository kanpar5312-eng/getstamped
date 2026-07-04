"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BubbleMenu from "@/components/ui/BubbleMenu";
import { BrandMark } from "@/components/ui/BrandMark";

/* Header: mobile keeps the BubbleMenu untouched. Desktop (≥900px) is a
   Kiro-style translucent dark chrome bar — logo left, uppercase nav
   center, sign-in + CTA right — with a warm glass light that follows the
   cursor (rAF lerp, not a CSS transition, so it trails smoothly instead
   of stuttering). The bar is deliberately ink-dark in BOTH themes (it's
   chrome, like the footer), so its colors are literal.

   NOTE on selectors: Styles.tsx has `.v3-root a { color: inherit }`
   (specificity 0,1,1) which BEATS a single-class rule (0,1,0) — that made
   the first version's light link colors silently lose and render dark-on-
   dark. Every color rule below is therefore `.gs-nav .gs-nav-*` (0,2,0). */

const NAV_ITEMS = [
  { label: "workspace", href: "/sign-in", ariaLabel: "Workspace" },
  { label: "pricing", href: "/pricing", ariaLabel: "Pricing" },
  { label: "faq", href: "#faq", ariaLabel: "FAQ" },
];

export function Header() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 900px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!mounted || !isDesktop) {
    return (
      <BubbleMenu
        useFixedPosition
        menuBg="var(--color-cream-soft)"
        menuContentColor="var(--color-ink)"
        menuAriaLabel="Toggle navigation"
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.12}
        logo={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--color-ink)",
              fontFamily: "var(--font-display-stack)",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            <BrandMark size={20} />
            GetStamped
          </span>
        }
        items={[
          ...NAV_ITEMS,
          { label: "sign in", href: "/sign-in", ariaLabel: "Sign in" },
          { label: "start free", href: "/sign-up", ariaLabel: "Start free" },
        ].map((item, i) => ({
          ...item,
          rotation: i % 2 === 0 ? -8 : 8,
          hoverStyles: {
            bgColor: i % 2 === 0 ? "var(--color-persimmon)" : "var(--color-persimmon-deep)",
            textColor: "var(--color-cream-soft)",
          },
        }))}
      />
    );
  }

  return <DesktopBar />;
}

/* ── Desktop chrome bar ─────────────────────────────────────────────── */

function DesktopBar() {
  const barRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const glow = glowRef.current;
    if (!bar || !glow) return;

    /* Buttery cursor-follow: lerp toward the target x every frame while
       hovering (and until it settles), instead of a CSS transition that
       restarts on every mousemove and reads as jitter. */
    let targetX = -300;
    let currentX = -300;
    let hovering = false;
    let raf = 0;

    const loop = () => {
      currentX += (targetX - currentX) * 0.18;
      glow.style.transform = `translate(${currentX.toFixed(1)}px, -50%)`;
      if (hovering || Math.abs(targetX - currentX) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      const r = bar.getBoundingClientRect();
      targetX = e.clientX - r.left - 130;
      hovering = true;
      glow.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      hovering = false;
      glow.style.opacity = "0";
    };

    bar.addEventListener("mousemove", onMove);
    bar.addEventListener("mouseleave", onLeave);
    return () => {
      bar.removeEventListener("mousemove", onMove);
      bar.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header ref={barRef} className="gs-nav" aria-label="Site navigation">
      {/* cursor-following glass light */}
      <div ref={glowRef} className="gs-nav-glow" aria-hidden />

      <Link href="/" className="gs-nav-logo" aria-label="GetStamped — home">
        <BrandMark size={22} />
        <span>GetStamped</span>
      </Link>

      <nav className="gs-nav-links" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <Link key={item.label} href={item.href} className="gs-nav-link" aria-label={item.ariaLabel}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="gs-nav-actions">
        <Link href="/sign-in" className="gs-nav-signin">
          Sign in
        </Link>
        <Link href="/sign-up" className="gs-nav-cta">
          Start free
        </Link>
      </div>

      <style>{`
        .gs-nav {
          position: fixed; top: 14px; left: 50%; z-index: 100;
          transform: translateX(-50%);
          width: min(1240px, calc(100vw - 32px));
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px;
          padding: 0 10px 0 22px;
          background: rgba(22, 19, 16, 0.72);
          -webkit-backdrop-filter: blur(22px) saturate(180%);
          backdrop-filter: blur(22px) saturate(180%);
          border: 1px solid rgba(245, 241, 232, 0.12);
          border-radius: 18px;
          box-shadow: 0 18px 48px -20px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.10);
          overflow: hidden;
          animation: gs-nav-in 600ms var(--ease-out) both;
        }
        @keyframes gs-nav-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .gs-nav .gs-nav-glow {
          position: absolute; top: 50%; left: 0;
          width: 260px; height: 200%;
          border-radius: 999px;
          background: radial-gradient(140px 46px at center,
            rgba(255, 158, 120, 0.22) 0%,
            rgba(255, 255, 255, 0.09) 45%,
            transparent 72%);
          opacity: 0; pointer-events: none;
          transform: translate(-300px, -50%);
          transition: opacity 300ms var(--ease-soft);
          will-change: transform, opacity;
        }

        .gs-nav .gs-nav-logo {
          display: inline-flex; align-items: center; gap: 9px;
          color: #F5F1E8; text-decoration: none;
          font-family: var(--font-display-stack);
          font-size: 19px; font-weight: 500; letter-spacing: -0.01em;
          position: relative; z-index: 1;
          flex-shrink: 0;
        }

        .gs-nav .gs-nav-links {
          display: flex; align-items: center; gap: 4px;
          position: relative; z-index: 1;
          margin: 0 auto;
        }
        .gs-nav .gs-nav-link {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(245, 241, 232, 0.78);
          text-decoration: none;
          padding: 9px 14px; border-radius: 10px;
          transition: color 180ms var(--ease-soft), background 180ms var(--ease-soft);
        }
        .gs-nav .gs-nav-link:hover {
          color: #FFFFFF;
          background: rgba(245, 241, 232, 0.08);
        }

        .gs-nav .gs-nav-actions {
          display: inline-flex; align-items: center; gap: 8px;
          position: relative; z-index: 1;
          flex-shrink: 0;
        }
        .gs-nav .gs-nav-signin {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(245, 241, 232, 0.9); text-decoration: none;
          padding: 10px 16px; border-radius: 12px;
          border: 1px solid rgba(245, 241, 232, 0.22);
          transition: border-color 180ms var(--ease-soft), color 180ms var(--ease-soft);
        }
        .gs-nav .gs-nav-signin:hover { border-color: rgba(245, 241, 232, 0.5); color: #FFFFFF; }
        .gs-nav .gs-nav-cta {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #1C1917; background: #F5F1E8; text-decoration: none;
          padding: 11px 18px; border-radius: 12px;
          transition: background 180ms var(--ease-soft), color 180ms var(--ease-soft),
            transform 180ms var(--ease-soft);
        }
        .gs-nav .gs-nav-cta:hover { background: var(--color-persimmon); color: #F5F1E8; transform: translateY(-1px); }
      `}</style>
    </header>
  );
}
