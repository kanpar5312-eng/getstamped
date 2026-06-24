"use client";

import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import { gsap } from "gsap";
import "./BubbleMenu.css";

/* ════════════════════════════════════════════════════════════════════════
   BubbleMenu — TS port of the React Bits BubbleMenu. Logo bubble +
   hamburger toggle that opens a full-screen overlay of pill links.
   GSAP timeline: each bubble scales 0→1 with a back.out, the label
   slides up 24px + fades in slightly behind. Closing reverses with
   a power3.in.

   Animation behavior is verbatim from the source; only the default
   `items` and colors are swapped for our brand.
   ═════════════════════════════════════════════════════════════════════════ */

export type BubbleMenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: { bgColor?: string; textColor?: string };
};

const DEFAULT_ITEMS: BubbleMenuItem[] = [
  {
    label: "workspace",
    href: "/sign-in",
    ariaLabel: "Workspace",
    rotation: -8,
    hoverStyles: { bgColor: "#E8622A", textColor: "#FAF8F4" },
  },
  {
    label: "pricing",
    href: "#pricing",
    ariaLabel: "Pricing",
    rotation: 8,
    hoverStyles: { bgColor: "#1C1917", textColor: "#FAF8F4" },
  },
  {
    label: "faq",
    href: "#faq",
    ariaLabel: "FAQ",
    rotation: 8,
    hoverStyles: { bgColor: "#E8622A", textColor: "#FAF8F4" },
  },
  {
    label: "sign in",
    href: "/sign-in",
    ariaLabel: "Sign in",
    rotation: 8,
    hoverStyles: { bgColor: "#1C1917", textColor: "#FAF8F4" },
  },
  {
    label: "start free",
    href: "/sign-up",
    ariaLabel: "Start free",
    rotation: -8,
    hoverStyles: { bgColor: "#E8622A", textColor: "#FAF8F4" },
  },
];

type Props = {
  logo?: ReactNode | string;
  onMenuClick?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  items?: BubbleMenuItem[];
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
};

export default function BubbleMenu({
  logo,
  onMenuClick,
  className,
  style,
  menuAriaLabel = "Toggle menu",
  menuBg = "#fff",
  menuContentColor = "#111",
  useFixedPosition = false,
  items,
  animationEase = "back.out(1.5)",
  animationDuration = 0.5,
  staggerDelay = 0.12,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const bubblesRef = useRef<HTMLAnchorElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;
  const containerClassName = ["bubble-menu", useFixedPosition ? "fixed" : "absolute", className]
    .filter(Boolean)
    .join(" ");

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);

    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: "flex" });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const tl = gsap.timeline({ delay });

        tl.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase,
        });
        if (labels[i]) {
          tl.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: "power3.out",
            },
            `-=${animationDuration * 0.9}`,
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: "power3.in",
      });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
          setShowOverlay(false);
        },
      });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean);
        const isDesktop = window.innerWidth >= 900;

        bubbles.forEach((bubble, i) => {
          const item = menuItems[i];
          if (bubble && item) {
            const rotation = isDesktop ? item.rotation ?? 0 : 0;
            gsap.set(bubble, { rotation });
          }
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen, menuItems]);

  return (
    <>
      <nav className={containerClassName} style={style} aria-label="Main navigation">
        <div
          className="bubble logo-bubble"
          aria-label="Logo"
          style={{ background: menuBg }}
        >
          <span className="logo-content">
            {typeof logo === "string" ? (
              <img src={logo} alt="Logo" className="bubble-logo" />
            ) : (
              logo
            )}
          </span>
        </div>

        <button
          type="button"
          className={`bubble toggle-bubble menu-btn ${isMenuOpen ? "open" : ""}`}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
          style={{ background: menuBg }}
        >
          <span className="menu-line" style={{ background: menuContentColor }} />
          <span className="menu-line short" style={{ background: menuContentColor }} />
        </button>
      </nav>
      {showOverlay && (
        <div
          ref={overlayRef}
          className={`bubble-menu-items ${useFixedPosition ? "fixed" : "absolute"}`}
          aria-hidden={!isMenuOpen}
        >
          <ul className="pill-list" role="menu" aria-label="Menu links">
            {menuItems.map((item, idx) => (
              <li key={idx} role="none" className="pill-col">
                <a
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  className="pill-link"
                  style={{
                    ["--item-rot" as string]: `${item.rotation ?? 0}deg`,
                    ["--pill-bg" as string]: menuBg,
                    ["--pill-color" as string]: menuContentColor,
                    ["--hover-bg" as string]: item.hoverStyles?.bgColor || "#f3f4f6",
                    ["--hover-color" as string]: item.hoverStyles?.textColor || menuContentColor,
                  } as CSSProperties}
                  ref={(el) => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  <span
                    className="pill-label"
                    ref={(el) => {
                      if (el) labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
