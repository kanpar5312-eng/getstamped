"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function DevStateSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      if (e.shiftKey && (e.key === "D" || e.key === "d") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <aside className="fixed bottom-6 right-6 z-50 w-[280px] rounded-2xl border border-dashed border-[var(--line-hover)] bg-[var(--surface)] p-4 shadow-[0_4px_20px_rgba(28,27,26,0.07)]">
      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--stone)]">
        Dev preview · states
      </p>
      <p className="mt-2 text-xs text-[var(--ink-soft)]">
        Rendering state{" "}
        <span className="font-mono font-medium text-[var(--ink)]">{current}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(["A", "B", "C", "D", "E", "F"] as const).map((s) => (
          <Link
            key={s}
            href={`/dashboard?state=${s}`}
            className={[
              "rounded-md border px-2.5 py-1 text-xs font-mono transition-colors",
              s === current
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:border-[var(--line-hover)]",
            ].join(" ")}
          >
            {s}
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--stone)]">
        shift+D to toggle.
      </p>
    </aside>
  );
}
