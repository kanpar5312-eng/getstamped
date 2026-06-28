"use client";

import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { usePricing } from "@/lib/PricingContext";

/* ════════════════════════════════════════════════════════════════════════
   Footer — Wavly 5-column layout. Cream-soft surface, Persimmon hairline
   at the top, brand block + Product / Company / Legal / Connect columns,
   bottom strip with copyright + tiny inline links.
   ═════════════════════════════════════════════════════════════════════════ */

const EMAIL = "getstamped.online@gmail.com";

type LinkItem = { label: string; href: string; external?: boolean };

const PRODUCT: LinkItem[] = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Mock interview", href: "/dashboard/mock-interview" },
];

const COMPANY: LinkItem[] = [
  { label: "About", href: "/#about" },
  { label: "Build log", href: "https://twitter.com", external: true },
  { label: "Contact", href: `mailto:${EMAIL}`, external: true },
  { label: "Dashboard", href: "/dashboard" },
];

const LEGAL: LinkItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Disclaimer", href: "/terms#disclaimer-of-warranty" },
];

const CONNECT: LinkItem[] = [
  { label: "Twitter / X", href: "https://twitter.com", external: true },
  { label: "Instagram", href: "https://instagram.com", external: true },
  { label: EMAIL, href: `mailto:${EMAIL}`, external: true },
];

function Out({ item }: { item: LinkItem }) {
  const cls =
    "text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-forest)] transition-colors";
  if (item.external) {
    return (
      <a
        href={item.href}
        target={item.href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noopener noreferrer"
        className={cls}
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={cls}>
      {item.label}
    </Link>
  );
}

function Column({ heading, items }: { heading: string; items: LinkItem[] }) {
  return (
    <div>
      <h4
        style={{
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 10,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          margin: 0,
          fontWeight: 700,
        }}
      >
        {heading}
      </h4>
      <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "grid", gap: 10 }}>
        {items.map((item) => (
          <li key={item.label}>
            <Out item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const { currency, toggle } = usePricing();
  const otherSymbol = currency === "INR" ? "$" : "₹";

  return (
    <footer
      style={{
        position: "relative",
        background: "var(--color-cream-soft)",
        borderTop: "1px solid var(--color-border-soft)",
        color: "var(--color-ink)",
      }}
    >
      {/* Persimmon hairline at the very top */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(232,98,42,0.6) 50%, transparent 100%)",
        }}
      />

      <div
        className="mx-auto max-w-7xl"
        style={{ padding: "56px 24px 24px" }}
      >
        <div
          className="gs-foot-grid grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 40,
          }}
        >
          {/* Brand block — spans 2 cols on desktop */}
          <div className="gs-foot-brand" style={{ gridColumn: "span 2" }}>
            <Link
              href="/"
              aria-label="GetStamped — home"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--color-ink)",
                textDecoration: "none",
                fontFamily: "var(--font-display-stack)",
                fontSize: 22,
              }}
            >
              <BrandMark size={28} />
              GetStamped
            </Link>
            <p
              style={{
                marginTop: 14,
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--color-ink-soft)",
                maxWidth: 320,
              }}
            >
              F-1 visa prep, end to end. Built by a 17-year-old.
            </p>
            <button
              type="button"
              onClick={toggle}
              style={{
                marginTop: 16,
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: 999,
                padding: "6px 14px",
                fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                fontSize: 11,
                color: "var(--color-ink-soft)",
                cursor: "pointer",
              }}
            >
              Pricing in {currency === "INR" ? "₹" : "$"} · switch to {otherSymbol}
            </button>
          </div>

          <Column heading="Product" items={PRODUCT} />
          <Column heading="Company" items={COMPANY} />
          <Column heading="Legal" items={LEGAL} />
          <Column heading="Connect" items={CONNECT} />
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--color-border-soft)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            fontSize: 12,
            color: "var(--color-muted)",
          }}
        >
          <span>© {year} GetStamped</span>
          <div style={{ display: "inline-flex", gap: 14 }}>
            <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
              Privacy
            </Link>
            <span aria-hidden style={{ opacity: 0.4 }}>·</span>
            <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>
              Terms
            </Link>
            <span aria-hidden style={{ opacity: 0.4 }}>·</span>
            <a
              href={`mailto:${EMAIL}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Email
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .gs-foot-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr !important;
          }
          .gs-foot-brand { grid-column: span 1 !important; }
        }
      `}</style>
    </footer>
  );
}
