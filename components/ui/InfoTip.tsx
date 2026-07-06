"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Small "i" info trigger with a short-text tooltip. Hover/focus opens it
 * on desktop; tap toggles it on touch (outside-tap closes). Shared between
 * the landing/pricing page cards and the dashboard upgrade cards — colors
 * are all var(--color-*) tokens, which already resolve correctly in both
 * registers, so this one component works unmodified in either place.
 */
export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="gs-infotip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="gs-infotip-btn"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        aria-label="More info"
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      <span role="tooltip" id={id} className={`gs-infotip-bubble${open ? " is-open" : ""}`}>
        {text}
      </span>

      <style>{`
        .gs-infotip {
          position: relative;
          display: inline-flex;
          align-items: center;
          margin-left: 6px;
        }
        .gs-infotip-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 15px;
          height: 15px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          background: transparent;
          color: var(--color-muted);
          font-family: var(--font-sans-stack);
          font-size: 9px;
          font-style: italic;
          font-weight: 600;
          line-height: 1;
          padding: 0;
          cursor: help;
          transition: border-color 150ms ease, color 150ms ease;
        }
        .gs-infotip-btn:hover,
        .gs-infotip-btn:focus-visible {
          border-color: var(--color-persimmon);
          color: var(--color-persimmon);
          outline: none;
        }
        .gs-infotip-bubble {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 8px);
          transform: translateX(-50%) translateY(4px);
          width: max-content;
          max-width: 200px;
          padding: 8px 10px;
          border-radius: 8px;
          /* Hardcoded, not var(--color-ink) — that token is a *text* color
             that flips to near-white in dark mode (bit us before on the
             upgrade page's promo banner), which would turn this into a
             near-invisible light tooltip. A tooltip is dark regardless of
             the surrounding page theme, same as most UI conventions. */
          background: #1C1917;
          color: #F7F3EC;
          font-family: var(--font-sans-stack);
          font-size: 11px;
          font-weight: 400;
          line-height: 1.45;
          text-align: left;
          text-transform: none;
          letter-spacing: 0;
          box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.35);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          z-index: 20;
          transition: opacity 160ms ease, transform 160ms ease, visibility 0s linear 160ms;
        }
        .gs-infotip-bubble.is-open {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
          transition: opacity 160ms ease, transform 160ms ease, visibility 0s linear 0s;
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-infotip-bubble { transition: opacity 0.01ms linear, visibility 0.01ms linear !important; }
        }
      `}</style>
    </span>
  );
}
