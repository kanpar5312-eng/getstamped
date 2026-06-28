"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

/* ════════════════════════════════════════════════════════════════════════
   Wavly-style navbar — fixed top, transparent until 8px of scroll, then
   glass with a Persimmon hairline at the very top edge. Desktop shows
   one row of inline links + Sign in text + Start free CTA. Mobile gets
   a hamburger that opens a glass dropdown.
   ═════════════════════════════════════════════════════════════════════════ */

const LINKS = [
  { label: "Workspace", href: "/sign-in" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`gs-nav ${scrolled ? "is-scrolled" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      <div className="mx-auto max-w-7xl" style={{ padding: "14px 24px" }}>
        <nav
          aria-label="Primary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          {/* Left — logo */}
          <Link
            href="/"
            aria-label="GetStamped — home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--color-ink)",
              fontFamily: "var(--font-display-stack)",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              textDecoration: "none",
            }}
          >
            <BrandMark size={20} />
            GetStamped
          </Link>

          {/* Center — inline links (desktop only) */}
          <ul
            className="gs-nav-links"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "none",
              gap: 22,
              fontFamily: "var(--font-sans-stack)",
              fontSize: 13.5,
              color: "var(--color-ink-soft)",
            }}
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    transition: "color 160ms ease",
                  }}
                  className="gs-nav-link"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/sign-in"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  transition: "color 160ms ease",
                }}
                className="gs-nav-link"
              >
                Sign in
              </Link>
            </li>
          </ul>

          {/* Right — CTA + mobile hamburger */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/sign-up"
              className="gs-nav-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 16px",
                borderRadius: 10,
                background: "var(--color-forest)",
                color: "var(--color-cream-soft)",
                fontFamily: "var(--font-sans-stack)",
                fontSize: 13.5,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 14px -6px rgba(232,98,42,0.45)",
                transition: "background-color 200ms ease",
              }}
            >
              Start free
            </Link>
            <button
              type="button"
              className="gs-nav-hamburger"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              style={{
                display: "inline-flex",
                width: 38,
                height: 38,
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                cursor: "pointer",
                color: "var(--color-ink)",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 1.5,
                  background: "currentColor",
                  boxShadow: open
                    ? "none"
                    : "0 -5px 0 currentColor, 0 5px 0 currentColor",
                  transform: open ? "rotate(45deg)" : "none",
                  transition: "transform 200ms ease",
                }}
              />
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {open && (
          <div
            className="gs-nav-dropdown"
            style={{
              marginTop: 12,
              borderRadius: 16,
              padding: 12,
              background: "rgba(250,246,237,0.85)",
              border: "1px solid var(--color-border-soft)",
              backdropFilter: "blur(24px) saturate(160%)",
              WebkitBackdropFilter: "blur(24px) saturate(160%)",
              boxShadow:
                "0 22px 50px -22px rgba(28,25,23,0.25)",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
              {[...LINKS, { label: "Sign in", href: "/sign-in" }].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 12px",
                      borderRadius: 10,
                      color: "var(--color-ink)",
                      fontFamily: "var(--font-sans-stack)",
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .gs-nav {
          background: transparent;
          border-bottom: 1px solid transparent;
          transition: background-color 220ms ease, border-color 220ms ease,
            backdrop-filter 220ms ease;
        }
        .gs-nav.is-scrolled {
          background: rgba(250, 246, 237, 0.55);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border-bottom: 1px solid rgba(226, 216, 198, 0.7);
          box-shadow: 0 1px 0 rgba(255,255,255,0.5) inset;
        }
        /* Persimmon hairline at the very top edge when scrolled */
        .gs-nav.is-scrolled::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(232, 98, 42, 0.55) 50%,
            transparent 100%
          );
        }
        .gs-nav-link:hover { color: var(--color-ink) !important; }
        .gs-nav-cta:hover { background: var(--color-forest-deep) !important; }
        @media (min-width: 900px) {
          .gs-nav-links { display: inline-flex !important; }
          .gs-nav-hamburger { display: none !important; }
        }
      `}</style>
    </header>
  );
}
