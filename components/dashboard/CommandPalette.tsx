"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STEPS, PHASE_META } from "@/lib/steps";

/**
 * GetStamped command palette.
 *
 *   • Opens on ⌘K / Ctrl+K from anywhere in the dashboard
 *   • Listens for `cmdk:open` custom event so other UI (the nav Search button)
 *     can open it without prop-drilling
 *   • Filter pills: All · Steps · Pages · Documents · Phases
 *   • Sections: Recents · Popular destinations · Trending (every step)
 *   • Keyboard: ↑/↓ move, Enter open, Esc close
 *   • Mac-safe: no setInterval, single event listener pair, palette unmounted
 *     when closed so it has zero cost while idle.
 */

type Category = "All" | "Steps" | "Pages" | "Documents" | "Phases";

type Result = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: Exclude<Category, "All">;
  badge?: "NEW" | "TRENDING" | "EXCLUSIVE";
  icon?: "step" | "doc" | "ask" | "voice" | "parent" | "settings" | "home" | "timeline" | "upgrade" | "phase";
};

const PAGES: Result[] = [
  { id: "home",        title: "Home",            subtitle: "Phase progress, next step, interview",                  href: "/dashboard",                category: "Pages", icon: "home" },
  { id: "timeline",    title: "Timeline",        subtitle: "All 47 F-1 steps",                                       href: "/dashboard/timeline",       category: "Pages", icon: "timeline" },
  { id: "documents",   title: "Documents",       subtitle: "Upload, organize, generate interview PDF",               href: "/dashboard/documents",      category: "Pages", icon: "doc" },
  { id: "mock",        title: "Mock Interview",  subtitle: "Voice-driven officer rehearsal",                         href: "/dashboard/mock-interview", category: "Pages", icon: "voice", badge: "NEW" },
  { id: "ask",         title: "Ask",             subtitle: "AI Q&A on every F-1 detail",                             href: "/dashboard/ask",            category: "Pages", icon: "ask",   badge: "NEW" },
  { id: "parent",      title: "Parent View",     subtitle: "Share progress with family",                             href: "/dashboard/parent-view",    category: "Pages", icon: "parent" },
  { id: "settings",    title: "Settings",        subtitle: "Profile, plan, notifications",                           href: "/dashboard/settings",       category: "Pages", icon: "settings" },
  { id: "upgrade",     title: "Upgrade",         subtitle: "Unlock all 47 steps + AI tools",                         href: "/dashboard/upgrade",        category: "Pages", icon: "upgrade", badge: "TRENDING" },
];

const PHASE_RESULTS: Result[] = PHASE_META.map((p) => ({
  id: `phase-${p.number}`,
  title: `Phase ${String(p.number).padStart(2, "0")} · ${p.name}`,
  subtitle: STEPS.filter((s) => s.phase === p.number).length + " steps",
  href: `/dashboard/timeline?phase=${p.number}`,
  category: "Phases" as const,
  icon: "phase" as const,
}));

const STEP_RESULTS: Result[] = STEPS.map((s) => ({
  id: `step-${s.number}`,
  title: `Step ${String(s.number).padStart(2, "0")} · ${s.title}`,
  subtitle: `${s.phaseName} · ${s.estimatedMinutes} min · ${s.documentsNeeded} doc${s.documentsNeeded === 1 ? "" : "s"}`,
  href: `/dashboard/timeline/${s.number}`,
  category: "Steps" as const,
  icon: "step" as const,
}));

const ALL_RESULTS: Result[] = [...PAGES, ...PHASE_RESULTS, ...STEP_RESULTS];

const RECENT_KEY = "gs_cmdk_recent";
const MAX_RECENT = 4;

function Icon({ kind }: { kind?: Result["icon"] }) {
  const props = {
    viewBox: "0 0 24 24",
    className: "h-4 w-4",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "step":     return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>;
    case "doc":      return <svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 14h6M9 18h4" /></svg>;
    case "ask":      return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case "voice":    return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>;
    case "parent":   return <svg {...props}><circle cx="9" cy="7" r="3" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><circle cx="17" cy="9" r="2" /></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
    case "home":     return <svg {...props}><path d="M3 12l9-9 9 9" /><path d="M5 10v10h14V10" /></svg>;
    case "timeline": return <svg {...props}><path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" /></svg>;
    case "upgrade":  return <svg {...props}><path d="M6 3h12l4 6-10 12L2 9l4-6z" /></svg>;
    case "phase":    return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" /></svg>;
    default:         return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
  }
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] transition-colors whitespace-nowrap",
        active
          ? "bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] border border-[var(--color-ink)]"
          : "text-[var(--color-ink-soft)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] hover:border-[var(--color-border)] hover:text-[var(--color-ink)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Badge({ kind }: { kind: NonNullable<Result["badge"]> }) {
  const tone =
    kind === "NEW"
      ? "bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] border-[var(--color-accent)]/30"
      : kind === "TRENDING"
      ? "bg-pink-500 text-white border-pink-500/60"
      : "bg-emerald-500 text-white border-emerald-500/60";
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${tone}`}>
      {kind}
    </span>
  );
}

function fuzzy(item: Result, q: string): number {
  if (!q) return 0;
  const hay = `${item.title} ${item.subtitle}`.toLowerCase();
  const needle = q.toLowerCase().trim();
  if (hay.includes(needle)) return 100 - hay.indexOf(needle);
  // Subsequence match — cheap, no library
  let i = 0;
  for (const c of hay) {
    if (c === needle[i]) i++;
    if (i >= needle.length) return 50;
  }
  return -1;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [activeIdx, setActiveIdx] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recents from localStorage on first open
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // Global open / close shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("cmdk:open", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("cmdk:open", onOpenEvent);
    };
  }, [open]);

  // Reset state each time it opens
  useEffect(() => {
    if (open) {
      setQ("");
      setCategory("All");
      setActiveIdx(0);
      // Focus after the modal mounts
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    let pool = ALL_RESULTS;
    if (category !== "All") pool = pool.filter((r) => r.category === category);
    if (!q.trim()) {
      // No query: show curated default list
      return pool;
    }
    return pool
      .map((r) => ({ r, score: fuzzy(r, q) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.r);
  }, [q, category]);

  // Clamp activeIdx into bounds when results change
  useEffect(() => {
    if (activeIdx >= filtered.length) setActiveIdx(0);
  }, [filtered.length, activeIdx]);

  const go = useCallback(
    (r: Result) => {
      // Push to recents (most-recent first, dedupe, cap)
      const next = [r.id, ...recents.filter((id) => id !== r.id)].slice(0, MAX_RECENT);
      setRecents(next);
      try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      setOpen(false);
      router.push(r.href);
    },
    [recents, router],
  );

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = filtered[activeIdx];
      if (r) go(r);
    }
  };

  // Scroll active result into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  if (!open) return null;

  const recentResults = recents
    .map((id) => ALL_RESULTS.find((r) => r.id === id))
    .filter((r): r is Result => Boolean(r));
  const popular = PAGES.filter((p) => ["mock", "ask", "upgrade"].includes(p.id));
  const trending = [...PAGES.filter((p) => !["mock", "ask", "upgrade"].includes(p.id))].slice(0, 6);

  const showSections = !q.trim() && category === "All";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick search"
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 pt-[10vh] sm:pt-[14vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 bg-[var(--color-ink)]/45 backdrop-blur-md"
        onMouseDown={() => setOpen(false)}
      />

      {/*
        Panel — anchored near the top of the viewport, not vertically
        centered. Centering against the full page height put the search
        input below the visible area whenever it was taller than what's
        actually on-screen (e.g. once the mobile keyboard opens and
        shrinks the visible viewport without shrinking `100vh` itself) —
        the user had to scroll down just to find the box they'd just
        opened. Anchoring near the top avoids that regardless of keyboard
        state, and matches how every other command palette (Linear,
        Raycast, VS Code) places itself.
      */}
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper-soft)] text-[var(--color-ink)] shadow-[0_40px_120px_-20px_rgba(20,33,28,0.45)] overflow-hidden animate-fade-up max-h-[70vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-[var(--color-border-soft)] bg-[var(--color-surface)]">
          <span className="text-[var(--color-muted)]"><Icon /></span>
          <input
            ref={inputRef}
            type="search"
            aria-label="Search steps, pages, and documents"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActiveIdx(0); }}
            onKeyDown={onInputKey}
            placeholder="Search steps, pages, documents…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent outline-none border-0 text-[15px] placeholder:text-[var(--color-muted)]/70 text-[var(--color-ink)]"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-paper-deep)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-muted)]">
            ESC
          </kbd>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 pt-3 pb-2 overflow-x-auto scrollbar-none border-b border-[var(--color-border-soft)] bg-[var(--color-paper-soft)]">
          {(["All", "Steps", "Pages", "Documents", "Phases"] as Category[]).map((c) => (
            <Pill key={c} active={category === c} onClick={() => { setCategory(c); setActiveIdx(0); }}>
              <span>{c}</span>
            </Pill>
          ))}
        </div>

        {/* Body */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-2 pb-3 bg-[var(--color-paper-soft)]">
          {showSections ? (
            <>
              {/* Recents */}
              {recentResults.length > 0 && (
                <Section title="Recents">
                  {recentResults.map((r, i) => (
                    <Row key={r.id} r={r} active={activeIdx === i} idx={i} onSelect={go} onHover={setActiveIdx} />
                  ))}
                </Section>
              )}

              {/* Popular products — gradient cards (saturated, readable on cream) */}
              <Section title="Popular destinations" right={<Link href="/dashboard/timeline" className="text-[12px] text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors">See all</Link>}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-3 pt-1">
                  {popular.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => go(p)}
                      className="text-left rounded-xl border border-white/15 p-3 overflow-hidden relative transition-transform hover:-translate-y-px text-[var(--color-paper-soft)]"
                      style={{
                        background:
                          p.id === "mock"
                            ? "linear-gradient(135deg, #1c86b8 0%, #143a2f 100%)"
                            : p.id === "ask"
                            ? "linear-gradient(135deg, #143a2f 0%, #229ed9 100%)"
                            : "linear-gradient(135deg, #db2777 0%, #143a2f 100%)",
                        boxShadow: "0 8px 24px -8px rgba(20,33,28,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-white/90">
                          <Icon kind={p.icon} /> {p.id === "mock" ? "Voice" : p.id === "ask" ? "AI" : "Hot"}
                        </span>
                        {p.badge && <Badge kind={p.badge} />}
                      </div>
                      <div className="mt-6 text-[14px] font-display tracking-tight uppercase">
                        {p.title}
                      </div>
                      <p className="mt-1 text-[11px] text-white/75 leading-snug line-clamp-2">
                        {p.subtitle}
                      </p>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Trending — two columns of pages */}
              <Section title="Trending">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-1">
                  {trending.map((r, i) => {
                    const idx = recentResults.length + i;
                    return (
                      <Row key={r.id} r={r} active={activeIdx === idx} idx={idx} onSelect={go} onHover={setActiveIdx} compact />
                    );
                  })}
                </div>
              </Section>
            </>
          ) : (
            // Filtered list
            <Section title={q.trim() ? `Results · ${filtered.length}` : category}>
              {filtered.length === 0 ? (
                <p className="px-4 py-10 text-center text-[13px] text-[var(--color-muted)]">
                  Nothing matches &ldquo;{q}&rdquo;.
                </p>
              ) : (
                filtered.map((r, i) => (
                  <Row key={r.id} r={r} active={activeIdx === i} idx={i} onSelect={go} onHover={setActiveIdx} />
                ))
              )}
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 sm:px-5 py-2 text-[11px] text-[var(--color-muted)]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-[var(--color-border-soft)] bg-[var(--color-paper-deep)] px-1 py-px font-mono text-[var(--color-ink-soft)]">↑</kbd>
              <kbd className="rounded border border-[var(--color-border-soft)] bg-[var(--color-paper-deep)] px-1 py-px font-mono text-[var(--color-ink-soft)]">↓</kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-[var(--color-border-soft)] bg-[var(--color-paper-deep)] px-1 py-px font-mono text-[var(--color-ink-soft)]">↵</kbd>
              open
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-[var(--color-border-soft)] bg-[var(--color-paper-deep)] px-1 py-px font-mono text-[var(--color-ink-soft)]">esc</kbd>
              close
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-persimmon)] animate-soft-pulse" />
            <span className="font-display text-[var(--color-ink-soft)]">GetStamped</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-3 first:mt-2">
      <header className="flex items-center justify-between px-4 pt-1 pb-1.5">
        <h3 className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-medium">{title}</h3>
        {right}
      </header>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function Row({
  r,
  active,
  idx,
  onSelect,
  onHover,
  compact = false,
}: {
  r: Result;
  active: boolean;
  idx: number;
  onSelect: (r: Result) => void;
  onHover: (i: number) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      data-idx={idx}
      onMouseEnter={() => onHover(idx)}
      onClick={() => onSelect(r)}
      className={[
        "group w-full text-left flex items-center gap-3 mx-1 rounded-lg transition-colors",
        compact ? "px-3 py-2" : "px-3 py-2.5",
        active
          ? "bg-[var(--color-paper-deep)] ring-1 ring-[var(--color-ink)]/20"
          : "hover:bg-[var(--color-paper-deep)]/60",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors shrink-0",
          active
            ? "border-[var(--color-ink)]/30 bg-[var(--color-persimmon)] text-[var(--color-paper-soft)]"
            : "border-[var(--color-border-soft)] bg-[var(--color-surface)] text-[var(--color-ink-soft)]",
        ].join(" ")}
        aria-hidden
      >
        <Icon kind={r.icon} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[var(--color-ink)] truncate">{r.title}</span>
          {r.badge && <Badge kind={r.badge} />}
        </span>
        <span className="block text-[11px] text-[var(--color-muted)] truncate mt-0.5">{r.subtitle}</span>
      </span>
      <span
        className={[
          "shrink-0 text-[var(--color-accent-deep)] text-[11px] font-mono transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-60",
        ].join(" ")}
      >
        ↵
      </span>
    </button>
  );
}
