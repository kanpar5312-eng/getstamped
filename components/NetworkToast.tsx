"use client";

import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   NetworkToast — bottom-center toast that appears when an async call
   fails. Listens for two signals:

     • window 'offline' event             → browser lost connectivity
     • window 'gs:network-error' CustomEvent → callers dispatch this from
       fetch / Supabase catch blocks

   To trigger from anywhere:
       window.dispatchEvent(new CustomEvent("gs:network-error"));
   or use notifyNetworkError() exported from this module.

   Auto-dismisses after 4s. After 3 failures within the same 30s window
   the copy flips to "Still having trouble. Try refreshing." to stop
   pretending things will spontaneously recover.
   ═════════════════════════════════════════════════════════════════════════ */

export function notifyNetworkError() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("gs:network-error"));
}

const INK       = "#1C1917";
const PERSIMMON = "#E8622A";
const PAPER     = "#FAF8F4";

export function NetworkToast() {
  const [visible, setVisible] = useState(false);
  const [retryExhausted, setRetryExhausted] = useState(false);
  const failuresRef = useRef<{ count: number; firstAt: number }>({ count: 0, firstAt: 0 });
  const dismissTimer = useRef<number | null>(null);

  useEffect(() => {
    const show = () => {
      const now = Date.now();
      const state = failuresRef.current;
      // Reset the rolling window every 30 seconds so a quiet hour of
      // failures isn't conflated with a fresh outage.
      if (now - state.firstAt > 30_000) {
        state.count = 0;
        state.firstAt = now;
      }
      state.count += 1;
      setRetryExhausted(state.count >= 3);
      setVisible(true);
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
      dismissTimer.current = window.setTimeout(() => setVisible(false), 4000);
    };

    const onOffline = () => show();
    const onCustom = () => show();
    window.addEventListener("offline", onOffline);
    window.addEventListener("gs:network-error", onCustom);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("gs:network-error", onCustom);
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "max(24px, env(safe-area-inset-bottom))",
        transform: "translateX(-50%)",
        zIndex: 100,
        background: INK,
        color: PAPER,
        borderRadius: 8,
        padding: "12px 20px",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.45), 0 4px 12px -4px rgba(0,0,0,0.25)",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-sans-stack)",
        fontSize: 13,
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: `2px solid ${PERSIMMON}`,
          borderTopColor: "transparent",
          animation: "gs-toast-spin 0.9s linear infinite",
          flexShrink: 0,
        }}
      />
      <span>
        {retryExhausted ? "Still having trouble. Try refreshing." : "Connection issue — retrying…"}
      </span>
      <style>{`
        @keyframes gs-toast-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
