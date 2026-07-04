"use client";

import { useState, useRef, useEffect, useLayoutEffect, type ReactNode, type CSSProperties } from "react";
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

  /** Tapping a pill should close the menu so the user isn't left
   *  staring at the overlay after they've made their choice. For
   *  in-page hash links (#pricing, #faq…) we close FIRST, wait for
   *  the close animation to release the fixed overlay, then run a
   *  smooth scroll. Doing the scroll while the overlay is still
   *  animating closed lets iOS Safari interrupt it. */
  const handlePillClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const isHash = href.startsWith("#");
    if (isHash) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Always close the menu — for both hash links and real navigations.
    if (isMenuOpen) {
      setIsMenuOpen(false);
      onMenuClick?.(false);
    }

    if (!isHash || typeof window === "undefined") return;
    const id = href.slice(1);

    // Wait for the GSAP close animation (~250ms) so the overlay is
    // fully out of the way before we ask the browser to smooth-scroll.
    window.setTimeout(() => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Update the URL hash without re-jumping, so refresh + back
        // button behave correctly afterwards.
        try {
          window.history.replaceState(null, "", `#${id}`);
        } catch {
          /* ignore */
        }
      } else {
        // Last-resort fallback if the section isn't in the DOM yet.
        window.location.hash = id;
      }
    }, 320);
  };

  // Hide the pills BEFORE the browser paints — otherwise on first open
  // they flash at full size for one frame before GSAP shrinks them to
  // scale 0 to animate up. Switching to useLayoutEffect makes the
  // initial state apply synchronously after DOM mutation, before paint.
  useLayoutEffect(() => {
    if (!showOverlay) return;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (bubbles.length) {
      gsap.set(bubbles, { scale: 0, transformOrigin: "50% 50%", autoAlpha: 1 });
    }
    if (labels.length) {
      gsap.set(labels, { y: 24, autoAlpha: 0 });
    }
  }, [showOverlay]);

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

      const isDesktop = typeof window !== "undefined" && window.innerWidth >= 900;
      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const tl = gsap.timeline({ delay });
        const targetRotation = isDesktop ? menuItems[i]?.rotation ?? 0 : 0;

        tl.to(bubble, {
          scale: 1,
          rotation: targetRotation,
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
          // Drop stale refs so the next open populates fresh elements
          // instead of animating against detached DOM nodes.
          bubblesRef.current = [];
          labelRefs.current = [];
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
              <img src={logo} alt="GetStamped logo" className="bubble-logo" />
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
                  onClick={(e) => handlePillClick(e, item.href)}
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
