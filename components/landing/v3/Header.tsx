"use client";

import { BrandMark } from "@/components/ui/BrandMark";
import BubbleMenu from "@/components/ui/BubbleMenu";

/* BubbleMenu nav — replaces the prior horizontal v3 header on both
   desktop and mobile. Logo bubble + hamburger toggle opens the
   full-screen pill overlay. Animation params and behavior are the
   React Bits defaults; only colors + items are brand-swapped. */
export function Header() {
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
      items={[
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
      ]}
    />
  );
}
