"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

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
 * NotificationCenter — subscribes to public.notifications via Supabase Realtime
 * for the current user. On INSERT, slides in a brand-styled toast at top-right
 * and stacks up to 3 at a time. Each toast auto-dismisses after 6s or on click.
 *
 * Mount once near the root (dashboard layout). Pass the userId from session;
 * if null, the component renders nothing.
 */
export function NotificationCenter({ userId }: Props) {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const dismissTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!userId) return;
    if (!isSupabaseConfigured()) return;
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    if (!url || !key) return;

    const sb = createBrowserClient(url, key);

    const channel = sb
      .channel(`notif:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new as Notification;
          pushToast(n);
        },
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
      Object.values(dismissTimersRef.current).forEach((t) => window.clearTimeout(t));
    };
  }, [userId]);

  const pushToast = (n: Notification) => {
    setToasts((prev) => {
      const next = [n, ...prev].slice(0, 3);
      return next;
    });
    const t = window.setTimeout(() => {
      dismiss(n.id);
    }, 6000);
    dismissTimersRef.current[n.id] = t;
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (dismissTimersRef.current[id]) {
      window.clearTimeout(dismissTimersRef.current[id]);
      delete dismissTimersRef.current[id];
    }
  };

  if (!userId) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: "fixed",
        top: 80,
        right: 20,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const accent = kindAccent(t.kind);
        const content = (
          <article
            key={t.id}
            style={{
              pointerEvents: "auto",
              minWidth: 280,
              maxWidth: 360,
              background: "var(--color-paper-soft)",
              border: "1px solid var(--color-border)",
              borderLeft: `3px solid ${accent}`,
              borderRadius: 12,
              padding: "12px 14px",
              boxShadow:
                "0 12px 32px -12px rgba(28, 27, 26, 0.18), 0 4px 12px -6px rgba(28, 27, 26, 0.08)",
              animation: "notif-slide-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: accent,
                  marginTop: 6,
                  boxShadow: `0 0 0 3px ${accent}22`,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-ink)",
                    lineHeight: 1.3,
                  }}
                >
                  {t.title}
                </p>
                {t.body && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "var(--color-ink-soft)",
                      lineHeight: 1.45,
                    }}
                  >
                    {t.body}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dismiss(t.id);
                }}
                aria-label="Dismiss"
                style={{
                  flexShrink: 0,
                  background: "transparent",
                  border: "none",
                  color: "var(--color-muted)",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 2,
                  marginTop: -2,
                  marginRight: -4,
                }}
              >
                ×
              </button>
            </div>
          </article>
        );
        return t.href ? (
          <Link
            key={t.id}
            href={t.href}
            onClick={() => dismiss(t.id)}
            style={{ textDecoration: "none" }}
          >
            {content}
          </Link>
        ) : (
          <div key={t.id}>{content}</div>
        );
      })}
      <style>{`
        @keyframes notif-slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function kindAccent(kind: string): string {
  switch (kind) {
    case "step_complete":
    case "doc_checked":
      return "#2F7D5B"; // success green
    case "doc_attention":
    case "interview_reminder":
      return "var(--color-persimmon)";
    case "parent_view_viewed":
      return "#52489A"; // violet
    default:
      return "var(--color-ink)";
  }
}
