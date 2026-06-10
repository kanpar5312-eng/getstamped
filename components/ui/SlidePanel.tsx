"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string; // e.g. "max-w-[480px]"
};

/**
 * Right-anchored slide-in panel. Full height. Glass surface.
 * Used for: "Why this matters" step context + the Ask chat panel.
 */
export function SlidePanel({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  width = "max-w-[480px]",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    queueMicrotask(() => ref.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-md animate-fade-up"
        style={{ animationDuration: "200ms" }}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "panel-title" : undefined}
        tabIndex={-1}
        className={[
          "absolute right-0 top-0 h-full w-full",
          width,
          "border-l border-white/40",
          "bg-[var(--color-cream-soft)]/95 backdrop-blur-2xl backdrop-saturate-150",
          "ring-1 ring-white/30",
          "shadow-[0_40px_100px_-30px_rgba(20,33,28,0.5)]",
          "flex flex-col",
        ].join(" ")}
        style={{
          animation: "panel-slide 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        <style>{`
          @keyframes panel-slide {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        <header className="relative p-6 pr-12 border-b border-[var(--color-border-soft)]">
          {eyebrow && (
            <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              id="panel-title"
              className="mt-2 font-display text-xl sm:text-2xl tracking-tight text-[var(--color-ink)] leading-snug"
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="absolute top-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-cream-deep)] hover:text-[var(--color-ink)] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <footer className="border-t border-[var(--color-border-soft)] p-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
