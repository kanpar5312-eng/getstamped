"use client";

import { useEffect, useState } from "react";
import BubbleMenu from "@/components/ui/BubbleMenu";
import PillNav from "@/components/ui/PillNav";
import { BrandMark } from "@/components/ui/BrandMark";

/* Header switches between PillNav (desktop ≥900px) and BubbleMenu
   (mobile). The matchMedia listener is SSR-safe — server renders the
   mobile fallback, the client swaps once mounted. */

const NAV_ITEMS = [
  { label: "workspace", href: "/sign-in", ariaLabel: "Workspace" },
  { label: "pricing", href: "/pricing", ariaLabel: "Pricing" },
  { label: "faq", href: "#faq", ariaLabel: "FAQ" },
  { label: "sign in", href: "/sign-in", ariaLabel: "Sign in" },
  { label: "start free", href: "/sign-up", ariaLabel: "Start free" },
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
        menuBg="#FAF8F4"
        menuContentColor="#1C1917"
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
              color: "#1C1917",
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
        items={NAV_ITEMS.map((item, i) => ({
          ...item,
          rotation: i % 2 === 0 ? -8 : 8,
          hoverStyles: {
            bgColor: i % 2 === 0 ? "#E8622A" : "#1C1917",
            textColor: "#FAF8F4",
          },
        }))}
      />
    );
  }

  return (
    <PillNav
      logo={
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#1C1917",
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
      logoAlt="GetStamped"
      logoBg="#FAF8F4"
      items={NAV_ITEMS}
      baseColor="#1C1917"
      pillColor="#FAF8F4"
      hoveredPillTextColor="#FAF8F4"
      pillTextColor="#1C1917"
      accentColor="#E8622A"
      ease="power3.out"
      initialLoadAnimation
    />
  );
}
