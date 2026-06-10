"use client";

import { useTheme } from "@/lib/ThemeContext";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

type Props = {
  className?: string;
  variant?: "icon" | "row";
};

export function ThemeToggle({ className = "", variant = "icon" }: Props) {
  const { theme, toggle } = useTheme();

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={[
          "w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded-md transition-colors text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream-deep)]",
          className,
        ].join(" ")}
      >
        <span className="inline-flex items-center gap-2">
          {theme === "dark" ? <MoonIcon /> : <SunIcon />}
          {theme === "dark" ? "Dark mode" : "Light mode"}
        </span>
        <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">
          Switch
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-border)] hover:text-[var(--color-ink)] transition-colors",
        className,
      ].join(" ")}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
