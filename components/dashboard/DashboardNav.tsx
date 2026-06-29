"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccountMenu } from "@/components/dashboard/AccountMenu";
import { BrandMark } from "@/components/ui/BrandMark";
import { NotificationBell } from "@/components/notifications/NotificationBell";

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
  { label: "Feedback",      href: "/dashboard/feedback",       group: "secondary", badge: "new" },
  { label: "Ask",           href: "/dashboard/ask",            group: "secondary", badge: "new" },
  { label: "Parent View",   href: "/dashboard/parent-view",    group: "secondary" },
  { label: "Support",       href: "/support",                  group: "secondary" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function DiamondIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
      <path d="M2 9h20" />
      <path d="M12 3l-3 6 3 12 3-12-3-6z" />
    </svg>
  );
}

function NewPill() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-[4px] bg-[var(--ember-soft)] text-[var(--ember-hover)] px-1.5 py-[2px] text-[10px] font-semibold uppercase tracking-[0.04em] leading-none">
      NEW
    </span>
  );
}

type Props = {
  initials: string;
  email?: string | null;
  plan?: Plan;
  userId?: string | null;
  /** Red urgency dot on the Feedback tab — failed doc OR readiness < 60. */
  feedbackUrgent?: boolean;
};

export function DashboardNav({ initials, email, plan = "free", userId = null, feedbackUrgent = false }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const planLabel = plan === "free" ? "Free" : plan === "solo" ? "Solo" : "Family";

  const tabClass = (active: boolean) =>
    [
      "relative inline-flex items-center h-16 px-1 text-[13px] whitespace-nowrap transition-colors duration-150",
      active
        ? "text-[var(--ink)] font-semibold"
        : "text-[var(--ink-soft)] font-normal hover:text-[var(--ink)]",
    ].join(" ");

  // Refs for each tab + the gliding underline — desktop AND mobile
  // (mobile got dropped during a redesign; restoring it here keeps the
  // active tab discoverable inside the horizontal scroll strip).
  const navRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const mobileTabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number; top: number; visible: boolean }>({
    left: 0,
    width: 0,
    top: 0,
    visible: false,
  });
  const [mobileIndicator, setMobileIndicator] = useState<{ left: number; width: number; top: number; visible: boolean }>({
    left: 0,
    width: 0,
    top: 0,
    visible: false,
  });
  const [hasMounted, setHasMounted] = useState(false);

  const setTabRef = useCallback(
    (href: string) => (el: HTMLAnchorElement | null) => {
      tabRefs.current[href] = el;
    },
    [],
  );
  const setMobileTabRef = useCallback(
    (href: string) => (el: HTMLAnchorElement | null) => {
      mobileTabRefs.current[href] = el;
    },
    [],
  );

  const measure = useCallback(() => {
    const activeHref = TABS.find((t) => isActive(t.href))?.href;
    if (!activeHref) {
      setIndicator((s) => ({ ...s, visible: false }));
      setMobileIndicator((s) => ({ ...s, visible: false }));
      return;
    }
    // We measure the [data-nav-label] span inside each tab, NOT the
    // whole anchor — otherwise sibling "NEW" pills inflate the rect
    // and the orange bar overshoots the heading text.
    const labelOf = (a: HTMLAnchorElement | null) =>
      (a?.querySelector("[data-nav-label]") as HTMLElement | null) ?? a;

    // Desktop indicator
    const nav = navRef.current;
    const tab = labelOf(tabRefs.current[activeHref]);
    if (nav && tab) {
      const navRect = nav.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - navRect.left,
        width: tabRect.width,
        // Anchor to the active tab's bottom edge (relative to nav)
        // so the bar sits directly under the text regardless of nav
        // padding.
        top: tabRect.bottom - navRect.top + 4,
        visible: true,
      });
    }
    // Mobile indicator — position is RELATIVE to the scrollable nav, so
    // it stays anchored to the active tab even if the user scrolls the
    // strip horizontally.
    const mnav = mobileNavRef.current;
    const mtab = labelOf(mobileTabRefs.current[activeHref]);
    if (mnav && mtab) {
      const navRect = mnav.getBoundingClientRect();
      const navScroll = mnav.scrollLeft;
      const mtabRect = mtab.getBoundingClientRect();
      setMobileIndicator({
        left: mtabRect.left - navRect.left + navScroll,
        width: mtabRect.width,
        top: mtabRect.bottom - navRect.top + 4,
        visible: true,
      });
    }
  }, [pathname]); // re-measure when route changes

  // Measure synchronously after layout to avoid first-paint flicker
  useLayoutEffect(() => {
    measure();
    setHasMounted(true);
  }, [measure]);

  // Re-measure on window resize (font load shifts, hydration, etc.)
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    // Re-measure after fonts load — display font weight changes shift the active tab's width
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full transition-all duration-350",
        // Apple-style glass: only kicks in once the user has scrolled,
        // so the page top feels open and the chrome surfaces on demand.
        scrolled ? "gs-glass-header" : "bg-transparent border-b border-transparent",
      ].join(" ")}
      style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <div className="w-full pl-4 pr-5 sm:pl-5 sm:pr-6 h-16 flex items-center">
        {/* Logo — pinned to viewport top-left */}
        <Link
          href="/dashboard"
          aria-label="GetStamped — dashboard"
          className="inline-flex items-center gap-2 shrink-0 text-[var(--ink)]"
        >
          <BrandMark size={26} priority />
          <span className="font-display text-[19px] leading-none tracking-tight text-[var(--ink)]">
            GetStamped
          </span>
        </Link>

        {/* Tabs — no scroll, single row; shared gliding underline */}
        <nav
          ref={navRef}
          aria-label="Dashboard sections"
          className="relative hidden lg:flex items-center gap-5 ml-8 min-w-0"
        >
          {TABS.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                ref={setTabRef(t.href)}
                aria-current={active ? "page" : undefined}
                data-nav-active={active ? "true" : undefined}
                className={tabClass(active)}
              >
                {/* Span wraps ONLY the label text — the indicator measures
                    this element so the orange bar matches the heading
                    width even when a "NEW" pill or red dot trails it. */}
                <span data-nav-label>{t.label}</span>
                {t.badge === "new" && <NewPill />}
                {feedbackUrgent && t.href === "/dashboard/feedback" ? (
                  <span
                    aria-label="Needs attention"
                    className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: "#EF4444" }}
                  />
                ) : null}
              </Link>
            );
          })}

          {/* Shared underline — glides between tabs on route change */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 h-[2px] rounded-full bg-[var(--ember)]"
            style={{
              top: `${indicator.top}px`,
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
              opacity: indicator.visible ? 1 : 0,
              // No transition on first mount → it snaps under Home rather than gliding from x=0
              transition: hasMounted
                ? "transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), width 0.36s cubic-bezier(0.22, 1, 0.36, 1), top 0.36s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease"
                : "opacity 0.2s ease",
              willChange: "transform, width",
              boxShadow: "0 0 8px rgba(232, 98, 42, 0.45)",
            }}
          />
        </nav>

        {/* Right cluster — 12px gaps, flush to viewport right edge */}
        <div className="ml-auto flex items-center gap-3 shrink-0 pl-4">
          {/* Search — icon button on mobile + tablet, expands wide on 2xl */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("cmdk:open"))}
            className="inline-flex 2xl:hidden h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--stone)] hover:border-[var(--line-hover)] hover:text-[var(--ink)] transition-colors"
            aria-label="Search (⌘K)"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("cmdk:open"))}
            className="hidden 2xl:inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] pl-2.5 pr-1.5 h-8 text-[12px] text-[var(--stone)] hover:border-[var(--line-hover)] hover:text-[var(--ink-soft)] transition-colors min-w-[200px]"
            aria-label="Search (⌘K)"
          >
            <SearchIcon />
            <span className="flex-1 text-left">Search</span>
            <span className="inline-flex items-center gap-0.5 rounded-md border border-[var(--line)] bg-[var(--surface-sunken)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--stone)]">
              ⌘K
            </span>
          </button>

          {/* Upgrade chip — Free · 30% off */}
          <Link
            href="/dashboard/upgrade"
            className="gs-glow group inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] h-8 px-2.5 text-[12px] font-medium text-[var(--ink)] hover:border-[var(--ember)] transition-colors"
            aria-label={`Plan · ${planLabel}`}
          >
            <span className="text-[var(--ember)]">
              <DiamondIcon />
            </span>
            <span>{planLabel}</span>
            {plan === "free" && (
              <>
                <span aria-hidden className="text-[var(--stone)]">·</span>
                <span className="text-[var(--ember-hover)]">30% off</span>
              </>
            )}
          </Link>

          {/* Notifications — bell + dropdown + realtime */}
          <NotificationBell userId={userId} />

          {/* Avatar */}
          <AccountMenu initials={initials} email={email} />
        </div>
      </div>

      {/* Mobile / tablet section row — with the same gliding orange
          underline as desktop. Positioned relative so the absolute
          indicator anchors against the scrollable nav element. */}
      <nav
        ref={mobileNavRef}
        aria-label="Dashboard sections (mobile)"
        className="lg:hidden relative flex items-center gap-1 px-5 pb-2.5 overflow-x-auto scrollbar-none"
      >
        {TABS.map((t) => {
          const active = isActive(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              ref={setMobileTabRef(t.href)}
              className={[
                "relative text-[12px] px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap inline-flex items-center",
                active
                  ? "text-[var(--ink)] font-semibold"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              <span data-nav-label>{t.label}</span>
              {t.badge === "new" && <NewPill />}
            </Link>
          );
        })}
        {/* Gliding mobile underline. Anchors to the active tab's bottom
            edge so the bar sits directly under the label regardless of
            the nav's bottom padding or horizontal scroll position. */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 h-[2px] rounded-full bg-[var(--ember)]"
          style={{
            top: `${mobileIndicator.top}px`,
            transform: `translateX(${mobileIndicator.left}px)`,
            width: `${mobileIndicator.width}px`,
            opacity: mobileIndicator.visible ? 1 : 0,
            transition: hasMounted
              ? "transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), width 0.36s cubic-bezier(0.22, 1, 0.36, 1), top 0.36s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease"
              : "opacity 0.2s ease",
            willChange: "transform, width",
            boxShadow: "0 0 8px rgba(232, 98, 42, 0.45)",
          }}
        />
      </nav>
    </header>
  );
}
