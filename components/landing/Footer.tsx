"use client";

import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BrandMark } from "@/components/ui/BrandMark";

const EMAIL = "founder@getstamped.app";

type LinkItem = { label: string; href: string; external?: boolean };

const PRODUCT: LinkItem[] = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/#features" },
  { label: "FAQ", href: "/faq" },
  { label: "Mock interview", href: "/#features" },
];

const COMPANY: LinkItem[] = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
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
        className="text-sm text-[#F7F3EC]/85 hover:text-[var(--color-persimmon-soft)] transition-colors"
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link
      href={item.href}
      className="text-sm text-[#F7F3EC]/85 hover:text-[var(--color-persimmon-soft)] transition-colors"
    >
      {item.label}
    </Link>
  );
}

function Column({ heading, items }: { heading: string; items: LinkItem[] }) {
  return (
    <div>
      <Eyebrow className="!text-[#F7F3EC]/50">{heading}</Eyebrow>
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

  return (
    <footer className="relative z-10 w-full bg-[#1C1917] text-[#F7F3EC]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-persimmon)]/70 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 pt-16 lg:pt-20 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">
          {/* Brand block — 2 of 5 conceptual cols */}
          <div className="lg:col-span-4 max-w-[360px]">
            <Link
              href="/"
              aria-label="GetStamped — home"
              className="inline-flex items-center gap-2 text-[#F7F3EC]"
            >
              <BrandMark size={28} />
              <span className="font-display text-[22px] leading-none tracking-tight text-[#F7F3EC]">
                GetStamped
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-[#F7F3EC]/70">
              F-1 visa prep, end to end.
            </p>
            <p className="mt-3 text-xs text-[#F7F3EC]/50">
              Built by a 17-year-old.{" "}
              <Link
                href="/about"
                className="underline underline-offset-2 hover:text-[var(--color-persimmon-soft)] transition-colors"
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
            <Eyebrow className="!text-[#F7F3EC]/50">Connect</Eyebrow>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#F7F3EC]/85 hover:text-[var(--color-persimmon-soft)] transition-colors"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#F7F3EC]/85 hover:text-[var(--color-persimmon-soft)] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-sm text-[#F7F3EC]/85 hover:text-[var(--color-persimmon-soft)] transition-colors"
                >
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-[#F7F3EC]/12" />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-[#F7F3EC]/40">
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
