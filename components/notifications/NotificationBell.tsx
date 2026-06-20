"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

type Props = { userId: string | null };

/**
 * Bell button → dropdown panel of notifications.
 *
 * Visual: dark slate panel, large title bar with bell glyph, items grouped
 * into Today / Earlier sections. Each item is a card with a kind-themed
 * square icon, bold title, descriptive body, and a relative timestamp at
 * top-right.
 *
 * Behaviour:
 * - Loads up to 20 most recent on mount.
 * - Subscribes to Realtime INSERTs so the panel updates live.
 * - Click any item → marks read + navigates (if href present).
 * - Unread badge on the bell, capped at 9+.
 */
export function NotificationBell({ userId }: Props) {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Outside click + Escape closes
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Initial fetch + realtime
  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) return;
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    if (!url || !key) return;

    const sb = createBrowserClient(url, key);
    let mounted = true;
    (async () => {
      const { data } = await sb
        .from("notifications")
        .select("id, kind, title, body, href, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (mounted && data) setItems(data as Notification[]);
    })();

    const channel = sb
      .channel(`notif-bell:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setItems((prev) => [payload.new as Notification, ...prev].slice(0, 20));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const u = payload.new as Notification;
          setItems((prev) => prev.map((n) => (n.id === u.id ? u : n)));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = items.filter((n) => !n.read_at).length;

  const markRead = async (id: string) => {
    if (!isSupabaseConfigured()) return;
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    if (!url || !key) return;
    const sb = createBrowserClient(url, key);
    await sb
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
  };

  const markAllRead = async () => {
    if (!isSupabaseConfigured() || !userId) return;
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    if (!url || !key) return;
    const sb = createBrowserClient(url, key);
    await sb
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    setItems((prev) =>
      prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })),
    );
  };

  // Bucket items into Today vs Earlier
  const now = Date.now();
  const todayCutoff = now - 24 * 60 * 60 * 1000;
  const today = items.filter((n) => new Date(n.created_at).getTime() >= todayCutoff);
  const earlier = items.filter((n) => new Date(n.created_at).getTime() < todayCutoff);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:border-[var(--line-hover)] hover:text-[var(--ink)] transition-colors"
      >
        <BellGlyph />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 inline-flex min-w-[16px] h-[16px] items-center justify-center rounded-full text-[9px] font-semibold px-1"
            style={{
              background: "#FF5B2E",
              color: "#FFFFFF",
              boxShadow: "0 0 0 2px var(--surface, #FFFFFF)",
            }}
            aria-hidden
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="gs-notif-panel"
          style={{
            background: "#0F1A24",
            color: "#E6ECF2",
            borderRadius: 18,
            boxShadow:
              "0 24px 60px -16px rgba(0,0,0,0.45), 0 6px 20px -6px rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
            zIndex: 50,
            animation: "notif-panel-in 220ms cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 20px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BellGlyph size={22} stroke="#E6ECF2" />
              <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>
                Notifications
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(230,236,242,0.65)",
                cursor: "pointer",
                fontSize: 22,
                lineHeight: 1,
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <div
              style={{
                padding: "0 20px 8px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#FF8A66",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Mark all read
              </button>
            </div>
          )}

          {/* Items */}
          <div style={{ maxHeight: 480, overflowY: "auto", padding: "0 14px 14px" }}>
            {items.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(230,236,242,0.7)" }}>
                  No notifications yet.
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 12,
                    color: "rgba(230,236,242,0.45)",
                  }}
                >
                  Complete a step to see one here.
                </p>
              </div>
            ) : (
              <>
                {today.length > 0 && (
                  <SectionHeader label="Today" />
                )}
                {today.map((n) => (
                  <NotificationCard
                    key={n.id}
                    n={n}
                    onActivate={() => {
                      if (!n.read_at) void markRead(n.id);
                      setOpen(false);
                    }}
                  />
                ))}

                {earlier.length > 0 && <SectionHeader label="Earlier" />}
                {earlier.map((n) => (
                  <NotificationCard
                    key={n.id}
                    n={n}
                    onActivate={() => {
                      if (!n.read_at) void markRead(n.id);
                      setOpen(false);
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes notif-panel-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════ Atoms ═══════════════════════════════ */

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "10px 8px 8px",
        fontSize: 13,
        fontWeight: 500,
        color: "rgba(230,236,242,0.55)",
      }}
    >
      {label}
    </div>
  );
}

function NotificationCard({
  n,
  onActivate,
}: {
  n: Notification;
  onActivate: () => void;
}) {
  const tile = kindTile(n.kind);
  const inner = (
    <div
      onClick={onActivate}
      style={{
        background: "#192633",
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 8,
        display: "flex",
        gap: 12,
        cursor: "pointer",
        transition: "background 160ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#1E2D3D")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#192633")}
    >
      {/* Icon tile */}
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: 48,
          height: 48,
          borderRadius: 10,
          background: tile.bg,
          color: tile.fg,
          display: "grid",
          placeItems: "center",
        }}
      >
        {tile.icon}
      </span>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.005em",
              lineHeight: 1.25,
            }}
          >
            {n.title}
          </p>
          <span
            style={{
              flexShrink: 0,
              fontSize: 11,
              color: "rgba(230,236,242,0.5)",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {relativeTime(n.created_at)}
          </span>
        </div>
        {n.body && (
          <p
            style={{
              margin: "5px 0 0",
              fontSize: 13,
              lineHeight: 1.5,
              color: "rgba(230,236,242,0.78)",
            }}
          >
            {n.body}
          </p>
        )}
      </div>
    </div>
  );
  return n.href ? (
    <Link href={n.href} style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

function kindTile(kind: string): { bg: string; fg: string; icon: React.ReactNode } {
  switch (kind) {
    case "step_complete":
    case "doc_checked":
      return {
        bg: "#0F2D1F",
        fg: "#2EE08B",
        icon: <CheckGlyph />,
      };
    case "doc_attention":
      return {
        bg: "#3A1F12",
        fg: "#FF8A66",
        icon: <AlertGlyph />,
      };
    case "interview_reminder":
      return {
        bg: "#3A1F12",
        fg: "#FF8A66",
        icon: <CalendarGlyph />,
      };
    case "parent_view_viewed":
      return {
        bg: "#1F1B3A",
        fg: "#9B8FE0",
        icon: <EyeGlyph />,
      };
    default:
      return {
        bg: "#1F2A36",
        fg: "#9CB0C6",
        icon: <DotGlyph />,
      };
  }
}

function BellGlyph({ size = 16, stroke = "currentColor" }: { size?: number; stroke?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
function AlertGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 9v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.7 3.86a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}
function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
function EyeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function DotGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const sec = Math.max(0, Math.floor((now - t) / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr === 1 ? "1 hour ago" : `${hr} hours ago`;
  const d = Math.floor(hr / 24);
  if (d === 1) return "1 day ago";
  if (d < 30) return `${d} days ago`;
  return new Date(iso).toLocaleDateString();
}
