import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { SUPPORT_EMAIL } from "@/lib/brand";

/**
 * DashboardFooter — thin legal/info row pinned to the bottom of every
 * authenticated dashboard page. Matches the GitHub-style horizontal
 * footer: small ink-soft text, generous gaps, persimmon on hover.
 *
 * Lives in app/dashboard/layout.tsx so it appears on every /dashboard/*
 * route consistently.
 */

type FooterLink = { label: string; href: string; external?: boolean };

const LINKS: FooterLink[] = [
  { label: "Terms",           href: "/terms" },
  { label: "Privacy",         href: "/privacy" },
  { label: "Refund",          href: "/refund" },
  { label: "Data Processing", href: "/dpa" },
  { label: "Support",         href: "/support" },
  { label: "Contact",         href: `mailto:${SUPPORT_EMAIL}`, external: true },
];

export function DashboardFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="ds-footer" aria-label="Site footer">
      <div className="ds-footer-inner">
        <Link href="/" className="ds-footer-brand" aria-label="GetStamped home">
          <BrandMark size={16} />
          <span>© {year} GetStamped</span>
        </Link>
        <nav className="ds-footer-links" aria-label="Legal and support">
          {LINKS.map((l) =>
            l.external ? (
              <a key={l.label} href={l.href}>{l.label}</a>
            ) : (
              <Link key={l.label} href={l.href}>{l.label}</Link>
            ),
          )}
        </nav>
      </div>
      <style>{`
        .ds-footer {
          width: 100%;
          border-top: 1px solid var(--color-border);
          background: var(--color-paper);
          padding: 20px 24px;
          font-family: var(--font-sans-stack);
        }
        .ds-footer-inner {
          max-width: 1140px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 12px 28px;
          color: var(--color-ink-soft);
          font-size: 12.5px;
        }
        .ds-footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-ink-soft);
          transition: color 200ms var(--ease-soft);
        }
        .ds-footer-brand:hover { color: var(--color-ink); }
        .ds-footer-links {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 12px 22px;
        }
        /* Animated underline — a hairline that grows in from the left on
           hover instead of a hard color snap. */
        .ds-footer-links a {
          position: relative;
          color: var(--color-ink-soft);
          text-decoration: none;
          transition: color 200ms var(--ease-soft);
        }
        .ds-footer-links a::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 100%;
          height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 300ms var(--ease-out);
        }
        .ds-footer-links a:hover { color: var(--color-persimmon); }
        .ds-footer-links a:hover::after,
        .ds-footer-links a:focus-visible::after { transform: scaleX(1); }
        @media (max-width: 640px) {
          .ds-footer { padding: 18px 20px 28px; }
          .ds-footer-inner { gap: 10px 20px; }
          .ds-footer-links { gap: 8px 18px; }
        }
      `}</style>
    </footer>
  );
}
