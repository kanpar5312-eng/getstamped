"use client";

import Link from "next/link";
import { useState } from "react";
import { AskPanel } from "@/components/dashboard/AskPanel";

function IconTimeline() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6h16M4 12h10M4 18h16" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
function IconMic() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 5h16v11H8l-4 4z" />
    </svg>
  );
}

const PILLS = [
  { label: "Full timeline", href: "/dashboard/timeline", Icon: IconTimeline },
  { label: "Documents", href: "/dashboard/documents", Icon: IconDoc },
  { label: "Mock interview", href: "/dashboard/mock-interview", Icon: IconMic },
] as const;

export function Block4QuickActions() {
  const [askOpen, setAskOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Quick actions"
        data-stagger=""
        style={{ "--stagger-index": 6 } as React.CSSProperties}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {PILLS.map(({ label, href, Icon }) => (
          <Link
            key={href}
            href={href}
            className="quick-pill inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-[10px] text-[13px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--line-hover)]"
          >
            <Icon />
            {label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setAskOpen(true)}
          className="quick-pill inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-[10px] text-[13px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--line-hover)]"
        >
          <IconChat />
          Ask a question
        </button>
      </nav>

      <AskPanel open={askOpen} onClose={() => setAskOpen(false)} />
    </>
  );
}
