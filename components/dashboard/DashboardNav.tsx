"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountMenu } from "@/components/dashboard/AccountMenu";

type Plan = "free" | "solo" | "family";

type Tab = {
  label: string;
  href: string;
  badge?: "new" | "beta";
  group?: "primary" | "secondary";
};

const TABS: Tab[] = [
  { label: "Home",          href: "/dashboard",                group: "primary"   },
  { label: "Timeline",      href: "/dashboard/timeline",       group: "primary"   },
  { label: "Documents",     href: "/dashboard/documents",      group: "primary"   },
  { label: "Mock Interview",href: "/dashboard/mock-interview", group: "secondary", badge: "new" },
  { label: "Ask",           href: "/dashboard/ask",            group: "secondary", badge: "new" },
  { label: "Parent View",   href: "/dashboard/parent-view",    group: "secondary" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
function GemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
      <path d="M11 3L8 9l4 12 4-12-3-6" />
      <path d="M2 9h20" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function NewPill() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-md bg-[var(--color-cream-deep)] px-1.5 py-px text-[9px] font-mono uppercase tracking-wider text-[var(--color-ink-soft)]">
      New
    </span>
  );
}

function Separator() {
  return (
    <span
      aria-hidden
      className="mx-1 h-4 w-px self-center bg-[var(--color-border)]"
    />
  );
}

type Props = {
  initials: string;
  email?: string | null;
  plan?: Plan;
};

export function DashboardNav({ initials, email, plan = "free" }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const primary = TABS.filter((t) => t.group === "primary");
  const secondary = TABS.filter((t) => t.group === "secondary");

  const planLabel = plan === "free" ? "Free" : plan === "solo" ? "Solo" : "Family";
  const planTone =
    plan === "free"
      ? "text-[var(--color-ink-soft)] border-[var(--color-border)] bg-[var(--color-surface)]"
      : "text-[var(--color-forest)] border-[var(--color-forest)]/30 bg-[var(--color-forest)]/[0.06]";

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full",
        "transition-[background-color,backdrop-filter,border-color] duration-300 ease-out",
        scrolled
          ? "bg-[var(--color-cream-soft)]/80 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/40"
          : "bg-[var(--color-cream)] border-b border-transparent",
      ].join(" ")}
    >
      {scrolled && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/60 to-transparent"
        />
      )}

      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        {/* Wordmark */}
        <Link
          href="/dashboard"
          aria-label="GetStamped — dashboard"
          className="inline-flex items-center gap-2 shrink-0 pr-2"
        >
          <span
            aria-hidden
            className="block h-3.5 w-3.5 rounded-[3px] bg-[var(--color-forest)]"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}
          />
          <span className="font-display text-[19px] leading-none tracking-tight text-[var(--color-ink)]">
            GetStamped
          </span>
        </Link>

        <Separator />

        {/* Primary + secondary nav, single line, dense */}
        <nav
          aria-label="Dashboard sections"
          className="hidden lg:flex items-center gap-0.5 min-w-0 overflow-x-auto scrollbar-none"
        >
          {primary.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                data-nav-active={active ? "true" : undefined}
                className={[
                  "inline-flex items-center px-2.5 py-1.5 text-[13px] rounded-md whitespace-nowrap transition-colors",
                  active
                    ? "font-medium"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
                ].join(" ")}
              >
                {t.label}
              </Link>
            );
          })}

          <Separator />

          {secondary.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                data-nav-active={active ? "true" : undefined}
                className={[
                  "inline-flex items-center px-2.5 py-1.5 text-[13px] rounded-md whitespace-nowrap transition-colors",
                  active
                    ? "font-medium"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
                ].join(" ")}
              >
                {t.label}
                {t.badge === "new" && <NewPill />}
              </Link>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Search */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("cmdk:open"))}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] pl-2.5 pr-1.5 py-1.5 text-[12px] text-[var(--color-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-ink-soft)] transition-colors min-w-[180px]"
            aria-label="Search (⌘K)"
          >
            <SearchIcon />
            <span className="flex-1 text-left">Search</span>
            <span className="inline-flex items-center gap-0.5 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-cream-deep)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-muted)]">
              ⌘K
            </span>
          </button>

          {/* Plan pill — like the "Pricing" badge in the reference */}
          <Link
            href="/dashboard/upgrade"
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:border-[var(--color-border)] ${planTone}`}
            aria-label={`Plan · ${planLabel}`}
          >
            <GemIcon />
            <span>{planLabel}</span>
            {plan === "free" && (
              <span className="ml-1 inline-flex items-center rounded-md bg-[var(--color-accent)] text-white px-1.5 py-px text-[9px] font-mono tracking-wider">
                30% OFF
              </span>
            )}
          </Link>

          {/* Documents shortcut — neutral, not the page primary action */}
          <Link
            href="/dashboard/documents"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium hover:border-[var(--line-hover,#D8D5D0)] transition-colors"
          >
            <FolderIcon />
            <span className="hidden sm:inline">Documents</span>
          </Link>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-border)] hover:text-[var(--color-ink)] transition-colors"
          >
            <BellIcon />
            <span
              className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--ember, currentColor)" }}
            />
          </button>

          {/* Avatar + dropdown (Settings, Theme, Sign out) */}
          <AccountMenu initials={initials} email={email} />
        </div>
      </div>

      {/* Mobile / tablet section row */}
      <nav
        aria-label="Dashboard sections (mobile)"
        className="lg:hidden flex items-center gap-1 px-4 pb-2.5 overflow-x-auto scrollbar-none"
      >
        {TABS.map((t) => {
          const active = isActive(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={[
                "text-[12px] px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap inline-flex items-center",
                active
                  ? "text-[var(--color-ink)] bg-[var(--color-cream-deep)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-cream-deep)]/60",
              ].join(" ")}
            >
              {t.label}
              {t.badge === "new" && <NewPill />}
            </Link>
          );
        })}
        <Link
          href="/dashboard/settings"
          className={[
            "ml-1 text-[12px] px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap",
            isActive("/dashboard/settings")
              ? "text-[var(--color-ink)] bg-[var(--color-cream-deep)]"
              : "text-[var(--color-ink-soft)]",
          ].join(" ")}
        >
          Settings
        </Link>
      </nav>
    </header>
  );
}
