"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type Props = {
  initials: string;
  email?: string | null;
};

export function AccountMenu({ initials, email }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-forest)] text-[var(--color-cream-soft)] text-xs font-medium tracking-tight"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-soft)] shadow-[0_30px_80px_-30px_rgba(20,33,28,0.25)] p-1 animate-fade-up z-50"
        >
          {email && (
            <div className="px-3 py-2 border-b border-[var(--color-border-soft)] mb-1">
              <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Signed in as</p>
              <p className="mt-1 text-xs text-[var(--color-ink)] truncate">{email}</p>
            </div>
          )}
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream-deep)] rounded-md transition-colors"
          >
            Settings
          </Link>
          <Link
            href="/dashboard/parent-view"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream-deep)] rounded-md transition-colors"
          >
            Parent view link
          </Link>
          <Link
            href="/dashboard/upgrade"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream-deep)] rounded-md transition-colors"
          >
            Upgrade plan
          </Link>
          <div className="mt-1 border-t border-[var(--color-border-soft)] pt-1">
            <ThemeToggle variant="row" />
          </div>
          <form action={signOut} className="mt-1 border-t border-[var(--color-border-soft)] pt-1">
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
