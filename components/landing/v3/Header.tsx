"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BubbleMenu from "@/components/ui/BubbleMenu";
import { BrandMark } from "@/components/ui/BrandMark";

/* Header: mobile keeps the BubbleMenu untouched. Desktop (≥900px) is a
   Kiro-style dark chrome bar — logo left, uppercase nav center, sign-in +
   CTA right — with a soft glass light that follows the cursor across the
   bar. The bar is deliberately ink-dark in BOTH themes (it's chrome, like
   the footer), so its colors are literal rather than token-driven; the
   persimmon accent is shared with everything else. No search — we don't
   have one. */

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
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = bar.getBoundingClientRect();
        glow.style.transform = `translate(${(e.clientX - r.left - 110).toFixed(0)}px, -50%)`;
        glow.style.opacity = "1";
      });
    };
    const onLeave = () => {
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
          background: rgba(20, 17, 15, 0.92);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          backdrop-filter: blur(18px) saturate(160%);
          border: 1px solid rgba(245, 241, 232, 0.10);
          border-radius: 18px;
          box-shadow: 0 18px 48px -20px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          overflow: hidden;
          animation: gs-nav-in 600ms var(--ease-out) both;
        }
        @keyframes gs-nav-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .gs-nav-glow {
          position: absolute; top: 50%; left: 0;
          width: 220px; height: 78%;
          border-radius: 999px;
          background: radial-gradient(130px 40px at center,
            rgba(255, 158, 120, 0.16) 0%,
            rgba(255, 255, 255, 0.07) 45%,
            transparent 75%);
          opacity: 0; pointer-events: none;
          transform: translate(-220px, -50%);
          transition: opacity 250ms var(--ease-soft), transform 140ms linear;
          will-change: transform, opacity;
        }

        .gs-nav-logo {
          display: inline-flex; align-items: center; gap: 9px;
          color: #F5F1E8; text-decoration: none;
          font-family: var(--font-display-stack);
          font-size: 19px; font-weight: 500; letter-spacing: -0.01em;
          position: relative; z-index: 1;
          flex-shrink: 0;
        }

        .gs-nav-links {
          display: flex; align-items: center; gap: 4px;
          position: relative; z-index: 1;
          margin: 0 auto;
        }
        .gs-nav-link {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(245, 241, 232, 0.72);
          text-decoration: none;
          padding: 9px 14px; border-radius: 10px;
          transition: color 180ms var(--ease-soft), background 180ms var(--ease-soft);
        }
        .gs-nav-link:hover {
          color: #F5F1E8;
          background: rgba(245, 241, 232, 0.07);
        }

        .gs-nav-actions {
          display: inline-flex; align-items: center; gap: 8px;
          position: relative; z-index: 1;
          flex-shrink: 0;
        }
        .gs-nav-signin {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(245, 241, 232, 0.85); text-decoration: none;
          padding: 10px 16px; border-radius: 12px;
          border: 1px solid rgba(245, 241, 232, 0.18);
          transition: border-color 180ms var(--ease-soft), color 180ms var(--ease-soft);
        }
        .gs-nav-signin:hover { border-color: rgba(245, 241, 232, 0.45); color: #F5F1E8; }
        .gs-nav-cta {
          font-family: var(--font-mono-stack, var(--font-sans-stack));
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #1C1917; background: #F5F1E8; text-decoration: none;
          padding: 11px 18px; border-radius: 12px;
          transition: background 180ms var(--ease-soft), transform 180ms var(--ease-soft);
        }
        .gs-nav-cta:hover { background: var(--color-persimmon); color: #F5F1E8; transform: translateY(-1px); }
      `}</style>
    </header>
  );
}
