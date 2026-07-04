"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/ui/BrandMark";

/* ════════════════════════════════════════════════════════════════════════
   Hero — full-bleed dark stage, nav baked into the hero itself (logo,
   pill links, CTA — same layout family as Header.tsx's desktop bar, but
   this hero is now the only nav on the page: the sitewide <Header/> is
   NOT rendered above it in MarketingLanding.tsx, to avoid a duplicate
   nav stacking on top of this one).

   Background is a from-scratch SVG glow (ink base + a persimmon/gold
   arc), not a hotlinked photo — same "dark stage, one glowing line"
   mood as the reference design, built entirely from brand tokens.
   ═════════════════════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { label: "Workspace", href: "/sign-in" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Hero() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <section className="gs-h2-root w-full isolate min-h-screen overflow-hidden relative">
      {/* Background — ink base + glowing persimmon/gold arc, all SVG/CSS */}
      <div className="gs-h2-bg" aria-hidden>
        <svg
          className="gs-h2-arc"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gs-h2-grad" x1="0%" y1="60%" x2="100%" y2="10%">
              <stop offset="0%" stopColor="#E8622A" stopOpacity="0" />
              <stop offset="45%" stopColor="#E8622A" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#F5A25A" stopOpacity="1" />
              <stop offset="100%" stopColor="#FBE8D9" stopOpacity="0.85" />
            </linearGradient>
            <filter id="gs-h2-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M -100 620 Q 500 520 900 340 T 1750 40"
            fill="none"
            stroke="url(#gs-h2-grad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#gs-h2-glow)"
          />
        </svg>
        <span className="gs-h2-vignette" />
      </div>

      {/* Nav — baked into the hero, replaces the sitewide Header on this
          page only (see MarketingLanding.tsx). */}
      <header className="z-10 relative">
        <div className="mx-6">
          <div className="flex items-center justify-between pt-6">
            <Link
              href="/"
              aria-label="GetStamped — home"
              className="inline-flex items-center gap-2 text-[#F5F1E8]"
              style={{ fontFamily: "var(--font-display-stack)", fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em" }}
            >
              <BrandMark size={22} />
              GetStamped
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-1 py-1 ring-1 ring-white/10 backdrop-blur">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/sign-in"
                  className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90 transition-colors"
                >
                  Start free
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </Link>
              </div>
            </nav>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur"
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white/90" aria-hidden>
                {mobileOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <>
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden mt-3 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/85 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-neutral-900"
              >
                Start free
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero content */}
      <div className="z-10 relative">
        <div className="sm:pt-28 md:pt-32 lg:pt-40 max-w-7xl mx-auto pt-24 px-6 pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="gs-h2-in-1 mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur">
              <span className="inline-flex items-center text-xs font-medium text-neutral-900 bg-white/90 rounded-full py-0.5 px-2">
                New
              </span>
              <span className="text-sm font-medium text-white/90">
                AI-scored mock interviews, live now
              </span>
            </div>

            <h1
              className="gs-h2-in-2 sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-4xl text-white tracking-tight font-normal"
              style={{ fontFamily: "var(--font-display-stack)", letterSpacing: "-0.025em" }}
            >
              Every step from home
              <br className="hidden sm:block" />
              to your US visa.
            </h1>

            <p className="gs-h2-in-3 sm:text-lg text-base text-white/80 max-w-2xl mt-6 mx-auto">
              The full F-1 route, sequenced for your home country — every form, fee, and
              interview between you and the stamp. AI document checks. Voice mock
              interviews. One workspace until your passport says yes.
            </p>

            <div className="gs-h2-in-4 flex flex-col sm:flex-row sm:gap-4 mt-10 gap-3 items-center justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 hover:bg-white/15 text-sm font-medium text-white bg-white/10 ring-white/15 ring-1 rounded-full py-3 px-5 transition-colors"
              >
                Start free — Phase 1 forever
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="#playbook"
                className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-3 text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                See how it works
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .gs-h2-bg { position: absolute; inset: 0; z-index: 0; background: var(--color-ink); overflow: hidden; }
        .gs-h2-arc { position: absolute; inset: 0; width: 100%; height: 100%; }
        .gs-h2-vignette {
          position: absolute; inset: 0;
          background:
            radial-gradient(120% 90% at 50% 100%, rgba(11,30,63,0.75) 0%, transparent 60%),
            linear-gradient(180deg, rgba(11,30,63,0.35) 0%, rgba(11,30,63,0) 30%, rgba(11,30,63,0.55) 100%);
          pointer-events: none;
        }

        @keyframes gs-h2-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .gs-h2-in-1 { animation: gs-h2-up 700ms var(--ease-out, cubic-bezier(0.22,1,0.36,1)) both; }
        .gs-h2-in-2 { animation: gs-h2-up 700ms var(--ease-out, cubic-bezier(0.22,1,0.36,1)) 120ms both; }
        .gs-h2-in-3 { animation: gs-h2-up 700ms var(--ease-out, cubic-bezier(0.22,1,0.36,1)) 240ms both; }
        .gs-h2-in-4 { animation: gs-h2-up 700ms var(--ease-out, cubic-bezier(0.22,1,0.36,1)) 360ms both; }

        @media (prefers-reduced-motion: reduce) {
          .gs-h2-in-1, .gs-h2-in-2, .gs-h2-in-3, .gs-h2-in-4 { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}
