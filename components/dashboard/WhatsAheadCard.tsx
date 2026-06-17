import Link from "next/link";
import { STEPS } from "@/lib/steps";

export function WhatsAheadCard({ staggerIndex = 2 }: { staggerIndex?: number }) {
  const first = STEPS.slice(0, 3);
  return (
    <section
      data-stagger=""
      style={{ "--stagger-index": staggerIndex } as React.CSSProperties}
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
    >
      <p data-eyebrow="">What's ahead</p>
      <ul className="mt-4 space-y-3">
        {first.map((s) => (
          <li key={s.number} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-[2px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-[var(--line-hover)] bg-transparent"
            />
            <span className="text-[13px] leading-snug text-[var(--ink-soft)]">
              <span className="mr-2 text-[var(--stone)] tabular-nums">
                {String(s.number).padStart(2, "0")}
              </span>
              {s.title}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/dashboard/timeline"
        className="mt-4 inline-block text-[13px] font-medium text-[var(--ember-hover)] hover:text-[var(--ember)] transition-colors"
      >
        See all 47 steps →
      </Link>
    </section>
  );
}
