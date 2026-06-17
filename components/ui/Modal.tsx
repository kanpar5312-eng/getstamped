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
  maxWidth?: string; // tailwind max-w-* class
};

/**
 * Centered glass modal per Wavly spec.
 * Esc closes; backdrop click closes; focus returns to trigger via the caller.
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  maxWidth = "max-w-md",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Move focus into modal for a11y
    queueMicrotask(() => ref.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-md"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        className={[
          "relative w-full animate-fade-up",
          "rounded-2xl border border-white/40",
          "bg-[var(--color-paper-soft)]/95",
          "backdrop-blur-2xl backdrop-saturate-150",
          "ring-1 ring-white/30",
          "shadow-[0_40px_100px_-30px_rgba(20,33,28,0.5)]",
          "p-6 sm:p-7",
          maxWidth,
        ].join(" ")}
      >
        <header className="relative pr-8">
          {eyebrow && (
            <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              id="modal-title"
              className="mt-2 font-display text-xl sm:text-2xl tracking-tight text-[var(--color-ink)] leading-snug"
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] hover:text-[var(--color-ink)] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="mt-5">{children}</div>

        {footer && (
          <footer className="mt-7 flex flex-wrap items-center justify-end gap-2">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
