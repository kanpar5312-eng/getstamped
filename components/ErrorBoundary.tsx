"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/* ════════════════════════════════════════════════════════════════════════
   ErrorBoundary — catches render-time exceptions in any child subtree
   and swaps in a branded "this page hit a snag" panel. Class component
   because React's getDerivedStateFromError / componentDidCatch lifecycle
   is only available on classes; everything inside the fallback is still
   composable.

   Scope: render errors only. Async failures from fetch / Supabase don't
   bubble through React's error system and need their own handling
   (see NetworkToast).
   ═════════════════════════════════════════════════════════════════════════ */

const INK       = "#1C1917";
const PERSIMMON = "#E8622A";
const PAPER     = "#FAF8F4";
const SUPPORT_EMAIL = "getstamped.online@gmail.com";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Single console.error is intentional — we don't want to spam Vercel
    // logs on every render of a broken subtree. componentStack helps
    // pinpoint which child blew up.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <ErrorFallback />;
  }
}

function ErrorFallback() {
  return (
    <div
      role="alert"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: PAPER,
        color: INK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        overflow: "hidden",
        fontFamily: "var(--font-sans-stack)",
      }}
    >
      {/* Decorative ghost word behind the panel */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          fontFamily: "var(--font-display-stack)",
          fontSize: "clamp(96px, 28vw, 220px)",
          color: "rgba(28,25,23,0.05)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        oops.
      </span>

      <div style={{ position: "relative", maxWidth: 480, width: "100%", textAlign: "center" }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: PERSIMMON,
            fontWeight: 600,
            margin: 0,
          }}
        >
          Something went wrong
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display-stack)",
            fontSize: "clamp(26px, 6vw, 32px)",
            lineHeight: 1.15,
            color: INK,
            fontWeight: 400,
            margin: "14px 0 0 0",
            letterSpacing: "-0.01em",
          }}
        >
          This page hit a snag.
        </h1>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--color-ink-soft, #4A4844)",
            margin: "12px auto 0",
            maxWidth: 380,
          }}
        >
          It&rsquo;s not you — something on our end broke. Try refreshing, or head back to the dashboard.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
          <button
            type="button"
            onClick={() => { if (typeof window !== "undefined") window.location.reload(); }}
            className="gs-btn-primary"
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: "13px 22px",
            }}
          >
            Refresh page
          </button>
          <a
            href="/dashboard"
            className="gs-btn-secondary"
            style={{
              display: "inline-block",
              textAlign: "center",
              color: INK,
              fontSize: 14,
              fontWeight: 500,
              padding: "12px 22px",
              textDecoration: "none",
            }}
          >
            Back to dashboard
          </a>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: "var(--color-muted, #857F73)" }}>
          If this keeps happening, email us:
          <br />
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: INK, textDecoration: "underline" }}>
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
