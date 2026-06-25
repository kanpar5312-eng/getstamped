"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import "./PillNav.css";

/* ════════════════════════════════════════════════════════════════════════
   PillNav — TS port of the React Bits PillNav. Animation timings are
   verbatim; only colors, the logo path, and the link layer (Next's
   <Link> instead of react-router) are swapped.

   Mobile is handled separately by <BubbleMenu/> via the parent <Header/>;
   this component only renders desktop markup.
   ═════════════════════════════════════════════════════════════════════════ */

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

type Props = {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  accentColor?: string;
  initialLoadAnimation?: boolean;
};

const isExternalLink = (href: string) =>
  href.startsWith("http://") ||
  href.startsWith("https://") ||
  href.startsWith("//") ||
  href.startsWith("mailto:") ||
  href.startsWith("tel:") ||
  href.startsWith("#");

export default function PillNav({
  logo,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  ease = "power3.out",
  baseColor = "#1C1917",
  pillColor = "#FAF8F4",
  hoveredPillTextColor = "#FAF8F4",
  pillTextColor,
  accentColor = "#E8622A",
  initialLoadAnimation = true,
}: Props) {
  const resolvedPillTextColor = pillTextColor ?? baseColor;

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const [, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;
        const R = (w * w / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta =
          Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" },
          0
        );

        if (label) {
          tl.to(
            label,
            { y: -(h + 8), duration: 2, ease, overwrite: "auto" },
            0
          );
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            white,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
            0
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    if (initialLoadAnimation) {
      const navItems = navItemsRef.current;
      const logoEl = logoRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, { scale: 1, duration: 0.6, ease });
      }
      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, { width: "auto", duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.6,
      ease,
      overwrite: "auto",
    });
  };

  const cssVars = {
    ["--base"]: baseColor,
    ["--pill-bg"]: pillColor,
    ["--hover-text"]: hoveredPillTextColor,
    ["--pill-text"]: resolvedPillTextColor,
    ["--hover-bg"]: accentColor,
    ["--accent"]: accentColor,
  } as CSSProperties;

  const homeHref = items?.[0]?.href ?? "#";

  const renderPillContent = (label: string, i: number) => (
    <>
      <span
        className="hover-circle"
        aria-hidden
        ref={(el) => {
          circleRefs.current[i] = el;
        }}
      />
      <span className="label-stack">
        <span className="pill-label">{label}</span>
        <span className="pill-label-hover" aria-hidden>
          {label}
        </span>
      </span>
    </>
  );

  return (
    <>
      {/* Logo lives in its own fixed bubble in the top-left so the pill
          nav can stay centered without the logo cramping it. */}
      <div className="pill-nav-logo-anchor" style={cssVars}>
        {isExternalLink(homeHref) ? (
          <a
            className="pill-logo"
            href={homeHref}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={logoRef}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          </a>
        ) : (
          <Link
            className="pill-logo"
            href={homeHref}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={logoRef as React.Ref<HTMLAnchorElement>}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          </Link>
        )}
      </div>

      <div className="pill-nav-container">
        <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
          <div className="pill-nav-items" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => {
              const active = activeHref === item.href;
              const className = `pill${active ? " is-active" : ""}`;
              const ariaLabel = item.ariaLabel || item.label;
              return (
                <li key={item.href || `item-${i}`} role="none">
                  {isExternalLink(item.href) ? (
                    <a
                      role="menuitem"
                      href={item.href}
                      className={className}
                      aria-label={ariaLabel}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {renderPillContent(item.label, i)}
                    </a>
                  ) : (
                    <Link
                      role="menuitem"
                      href={item.href}
                      className={className}
                      aria-label={ariaLabel}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {renderPillContent(item.label, i)}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        </nav>
      </div>
    </>
  );
}
