"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/ui/BrandMark";

const NAV = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M3 7h18" />
          <path d="M3 12h18" />
          <path d="M3 17h18" />
        </>
      )}
    </svg>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // "scrolled" flips when the user moves past the cinematic hero (~70vh).
    // Until then the header rides on top of the dark video, so text + brand
    // need cream contrast. After, the header lands on Wavly cream and ink
    // text restores.
    let ticking = false;
    const check = () => {
      ticking = false;
      const threshold = Math.max(60, window.innerHeight * 0.7);
      setScrolled(window.scrollY > threshold);
    };
    // rAF-gated so a fast mobile fling doesn't run this on every single
    // native scroll event — same pattern as the rest of the landing page's
    // scroll listeners (Hero.tsx, ScrollTransitions.tsx).
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(check);
      }
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "transition-[background-color,backdrop-filter,border-color] duration-500 ease-out",
        scrolled
          ? "bg-[var(--color-paper-soft)]/75 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/40"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      {scrolled && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/60 to-transparent"
        />
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-10 py-4">
        <Link
          href="/"
          aria-label="GetStamped — home"
          className={[
            "inline-flex items-center gap-2 transition-colors duration-500",
            scrolled ? "text-[var(--color-ink)]" : "text-white",
          ].join(" ")}
        >
          <BrandMark size={28} priority />
          <span
            className={[
              "font-display text-[22px] leading-none tracking-tight transition-colors duration-500",
              scrolled ? "text-[var(--color-ink)]" : "text-[#FFFFFF]",
            ].join(" ")}
            style={!scrolled ? { textShadow: "0 1px 12px rgba(0,0,0,0.55)" } : undefined}
          >
            GetStamped
          </span>
        </Link>

        {/* Center nav (desktop) */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={[
                "text-sm px-3 py-1.5 rounded-md transition-colors duration-300",
                scrolled
                  ? "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-deep)]/60"
                  : "text-[rgba(250,246,237,0.82)] hover:text-[#FFFFFF] hover:bg-white/10",
              ].join(" ")}
              style={!scrolled ? { textShadow: "0 1px 10px rgba(0,0,0,0.55)" } : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/sign-in"
            className={[
              "text-sm px-3 py-1.5 rounded-md transition-colors duration-300",
              scrolled
                ? "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                : "text-[rgba(250,246,237,0.85)] hover:text-[#FFFFFF]",
            ].join(" ")}
            style={!scrolled ? { textShadow: "0 1px 10px rgba(0,0,0,0.55)" } : undefined}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={[
              "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300",
              scrolled
                ? "bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)]"
                : "bg-[#FFFFFF] text-[#1C1B1A] hover:bg-[#EDE7DA]",
            ].join(" ")}
            style={
              !scrolled
                ? { boxShadow: "0 8px 24px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.6)" }
                : undefined
            }
          >
            Start free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((s) => !s)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
          className={[
            "md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-300",
            scrolled
              ? "border-[var(--color-border-soft)] bg-[var(--color-surface)] text-[var(--color-ink-soft)]"
              : "border-white/25 bg-white/10 text-[#FFFFFF] backdrop-blur-md",
          ].join(" ")}
        >
          <MenuIcon open={mobileOpen} />
        </button>
      </div>

      {/* Mobile glass dropdown */}
      {mobileOpen && (
        <div className="md:hidden mx-4 mb-4 rounded-2xl border border-white/40 bg-[var(--color-paper-soft)]/95 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/30 shadow-[0_30px_80px_-30px_rgba(20,33,28,0.25)] p-4 animate-fade-up">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-[var(--color-ink)] px-3 py-2 rounded-md hover:bg-[var(--color-paper-deep)] transition-colors"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-[var(--color-border-soft)] flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-[var(--color-ink-soft)] px-3 py-2 rounded-md hover:bg-[var(--color-paper-deep)] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-lg bg-[var(--color-persimmon)] px-4 py-2 text-sm font-medium text-[var(--color-paper-soft)]"
              >
                Start free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
