"use client";

import { useEffect, useState } from "react";
import BubbleMenu from "@/components/ui/BubbleMenu";
import PillNav from "@/components/ui/PillNav";
import { BrandMark } from "@/components/ui/BrandMark";

/* Header switches between PillNav (desktop ≥900px) and BubbleMenu
   (mobile). The matchMedia listener is SSR-safe — server renders the
   mobile fallback, the client swaps once mounted. */

const NAV_ITEMS = [
  {
    label: "workspace",
    href: "/sign-in",
    ariaLabel: "Workspace",
    dropdown: [
      { label: "Timeline", description: "Every step, dated and in order.", href: "/sign-up" },
      { label: "Document Vault", description: "AI-checked uploads before they cost you a reappointment.", href: "/sign-up" },
      { label: "Mock Interview", description: "Practice out loud, scored like a real F-1 interview.", href: "/sign-up" },
    ],
  },
  {
    label: "pricing",
    href: "/pricing",
    ariaLabel: "Pricing",
    dropdown: [
      { label: "Free", description: "Phase 1 forever — 6 steps, 3 AI questions a day.", href: "/pricing" },
      { label: "Solo", description: "All 47 steps, unlimited AI, one-time payment.", href: "/pricing" },
      { label: "Family", description: "Two students, one payment, shared vault.", href: "/pricing" },
    ],
  },
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
        items={NAV_ITEMS.map((item, i) => ({
          ...item,
          rotation: i % 2 === 0 ? -8 : 8,
          // Resting color, not just hover — touch devices never trigger
          // :hover, so without this every bubble sat at the same flat
          // menuBg and was indistinguishable from its neighbors. Alternates
          // persimmon / persimmon-deep — NOT ink, since --color-ink inverts
          // to a light color in dark mode and would read as a near-white
          // fill there.
          baseStyles: {
            bgColor: i % 2 === 0 ? "var(--color-persimmon)" : "var(--color-persimmon-deep)",
            textColor: "var(--color-cream-soft)",
          },
          // Swapped pair on hover/press, for the rare hybrid touch+pointer
          // device that does trigger :hover.
          hoverStyles: {
            bgColor: i % 2 === 0 ? "var(--color-persimmon-deep)" : "var(--color-persimmon)",
            textColor: "var(--color-cream-soft)",
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
      logoAlt="GetStamped"
      logoBg="var(--color-cream-soft)"
      items={NAV_ITEMS}
      baseColor="var(--color-ink)"
      pillColor="var(--color-cream-soft)"
      /* Always shown against the persimmon accent hover, which doesn't
         change between themes — kept as a literal light color rather
         than a token that would flip dark in dark mode. */
      hoveredPillTextColor="#FAF8F4"
      pillTextColor="var(--color-ink)"
      accentColor="var(--color-persimmon)"
      ease="power3.out"
      initialLoadAnimation
    />
  );
}
