"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

/* Must be a child of the <form action={signOut}> to read its pending
   state — the button previously sat static (same label, not disabled)
   for the whole server round-trip, which read as "the button did
   nothing" even though the click had registered. */
function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      role="menuitem"
      disabled={pending}
      className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

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
        style={{
          width: 36,
          height: 36,
          background: "#1C1B1A",
          color: "#FFFFFF",
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          position: "relative",
          boxShadow:
            "0 2px 8px -2px rgba(28,27,26,0.25), 0 0 0 1px rgba(28,27,26,0.10)",
          transition: "box-shadow 200ms ease, transform 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 4px 14px -2px rgba(28,27,26,0.30), 0 0 0 2px #FF5B2E";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 2px 8px -2px rgba(28,27,26,0.25), 0 0 0 1px rgba(28,27,26,0.10)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span>{initials || "GS"}</span>
        {/* Persimmon online dot */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#FF5B2E",
            boxShadow: "0 0 0 2px var(--surface, #FFFFFF)",
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper-soft)] shadow-[0_30px_80px_-30px_rgba(20,33,28,0.25)] p-1 animate-fade-up z-50"
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
            className="block px-3 py-1.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-paper-deep)] rounded-md transition-colors"
          >
            Settings
          </Link>
          <Link
            href="/dashboard/parent-view"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-paper-deep)] rounded-md transition-colors"
          >
            Parent view link
          </Link>
          <Link
            href="/dashboard/upgrade"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-paper-deep)] rounded-md transition-colors"
          >
            Upgrade plan
          </Link>
          <div className="mt-1 border-t border-[var(--color-border-soft)] pt-1">
            <ThemeToggle />
          </div>
          <form action={signOut} className="mt-1 border-t border-[var(--color-border-soft)] pt-1">
            <SignOutButton />
          </form>
        </div>
      )}
    </div>
  );
}
