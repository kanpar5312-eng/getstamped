"use client";

import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BrandMark } from "@/components/ui/BrandMark";
import { usePricing } from "@/lib/PricingContext";

const EMAIL = "founder@getstamped.app";

type LinkItem = { label: string; href: string; external?: boolean };

const PRODUCT: LinkItem[] = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Mock interview", href: "/#voice" },
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
  { label: "DPA", href: "/dpa" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Disclaimer", href: "/terms#disclaimer-of-warranty" },
];

function LinkOut({ item }: { item: LinkItem }) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target={item.href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noopener noreferrer"
        className="text-sm text-[var(--color-ink)] hover:text-[var(--color-forsytha)] transition-colors"
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link
      href={item.href}
      className="text-sm text-[var(--color-ink)] hover:text-[var(--color-forsytha)] transition-colors"
    >
      {item.label}
    </Link>
  );
}

function Column({ heading, items }: { heading: string; items: LinkItem[] }) {
  return (
    <div>
      <Eyebrow className="!text-[var(--color-ink)]/55">{heading}</Eyebrow>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <LinkOut item={item} />
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
    <footer className="relative z-10 w-full bg-[var(--color-persimmon-tint)] text-[var(--color-ink)]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-persimmon)]/80 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 pt-16 lg:pt-20 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">
          {/* Brand block — 2 of 5 conceptual cols */}
          <div className="lg:col-span-4 max-w-[360px]">
            <Link
              href="/"
              aria-label="GetStamped — home"
              className="inline-flex items-center gap-2 text-[var(--color-ink)]"
            >
              <BrandMark size={28} />
              <span className="font-display text-[22px] leading-none tracking-tight text-[var(--color-ink)]">
                GetStamped
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-ink)]/75">
              F-1 visa prep, end to end.
            </p>
            <p className="mt-3 text-xs text-[var(--color-ink)]/55">
              Built by a 17-year-old.{" "}
              <Link
                href="/#about"
                className="underline underline-offset-2 hover:text-[var(--color-forsytha)] transition-colors"
              >
                Read the story →
              </Link>
            </p>
          </div>

          <div className="lg:col-span-2">
            <Column heading="Product" items={PRODUCT} />
          </div>
          <div className="lg:col-span-2">
            <Column heading="Company" items={COMPANY} />
          </div>
          <div className="lg:col-span-2">
            <Column heading="Legal" items={LEGAL} />
          </div>
          <div className="lg:col-span-2">
            <Eyebrow className="!text-[var(--color-ink)]/55">Connect</Eyebrow>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-ink)] hover:text-[var(--color-forsytha)] transition-colors"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-ink)] hover:text-[var(--color-forsytha)] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-sm text-[var(--color-ink)] hover:text-[var(--color-forsytha)] transition-colors"
                >
                  {EMAIL}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={toggle}
                  className="text-sm text-[var(--color-ink)]/65 hover:text-[var(--color-ink)] transition-colors"
                >
                  Pricing in {currency === "INR" ? "₹" : "$"} ·{" "}
                  <span className="underline underline-offset-2">
                    change to {otherSymbol}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-[var(--color-paper)]/10" />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--color-ink)]/45">
          <p>© {year} GetStamped</p>
          <p className="sm:max-w-md sm:text-right leading-relaxed">
            Not affiliated with any government agency. Information for
            guidance only — not legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
