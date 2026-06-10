"use client";

import Link from "next/link";
import { useState } from "react";
import { AskPanel } from "@/components/dashboard/AskPanel";

const ITEMS = [
  { label: "View full timeline", href: "/dashboard/timeline" },
  { label: "Documents", href: "/dashboard/documents" },
  { label: "Mock interview", href: "/dashboard/mock-interview" },
] as const;

function Dot() {
  return (
    <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--color-border)]" />
  );
}

export function Block4QuickActions() {
  const [askOpen, setAskOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Quick actions"
        className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-[var(--color-ink-soft)]"
      >
        {ITEMS.map((item, i) => (
          <span key={item.href} className="inline-flex items-center gap-5">
            <Link
              href={item.href}
              className="hover:text-[var(--color-accent-deep)] transition-colors"
            >
              {item.label}
            </Link>
            {i < ITEMS.length && <Dot />}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setAskOpen(true)}
          className="hover:text-[var(--color-accent-deep)] transition-colors"
        >
          Ask a question
        </button>
      </nav>

      <AskPanel open={askOpen} onClose={() => setAskOpen(false)} />
    </>
  );
}
