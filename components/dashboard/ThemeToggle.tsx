"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gs-theme";

function isDarkNow(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

/**
 * Dashboard-only dark mode switch. Toggles a `dark` class on <html>, which
 * app/globals.css scopes to [data-surface="dashboard"] only — so this has
 * zero effect on landing/marketing/auth pages. Persisted to localStorage;
 * app/layout.tsx has a tiny inline script that applies it before paint so
 * there's no light-mode flash on load.
 */
export function ThemeToggle() {
  // Start `false` so server and first client render match (avoids
  // hydration mismatch); the anti-flash script already set the real
  // class on <html> before hydration, we just read it back on mount.
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDarkNow());
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* localStorage unavailable — theme just won't persist across visits */
    }
  };

  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={dark}
      onClick={toggle}
      className="flex w-full items-center justify-between px-3 py-1.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-paper-deep)] rounded-md transition-colors"
    >
      <span className="inline-flex items-center gap-2">
        <SunMoonIcon dark={dark} />
        Dark mode
      </span>
      <span
        aria-hidden
        style={{
          position: "relative",
          width: 34,
          height: 20,
          borderRadius: 999,
          background: dark ? "var(--color-persimmon)" : "var(--color-border)",
          transition: "background-color 220ms cubic-bezier(0.22, 1, 0.36, 1)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: dark ? 16 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            transition: "left 220ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </span>
    </button>
  );
}

function SunMoonIcon({ dark }: { dark: boolean }) {
  return (
    <span
      className="relative inline-flex h-3.5 w-3.5 items-center justify-center text-[var(--color-ink-soft)]"
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: "absolute",
          inset: 0,
          opacity: dark ? 0 : 1,
          transform: dark ? "scale(0.6) rotate(-90deg)" : "scale(1) rotate(0deg)",
          transition: "opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: "absolute",
          inset: 0,
          opacity: dark ? 1 : 0,
          transform: dark ? "scale(1) rotate(0deg)" : "scale(0.6) rotate(90deg)",
          transition: "opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
      </svg>
    </span>
  );
}
