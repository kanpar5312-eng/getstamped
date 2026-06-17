import Link from "next/link";

export function MockTeaserCard({ staggerIndex = 3 }: { staggerIndex?: number }) {
  return (
    <section
      data-stagger=""
      style={{ "--stagger-index": staggerIndex } as React.CSSProperties}
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
    >
      <div className="flex items-center gap-2">
        <span className="badge-ember inline-flex items-center rounded-full px-2 py-[2px] text-[11px] font-semibold tracking-wide uppercase">
          New
        </span>
        <p data-eyebrow="">Mock interview</p>
      </div>
      <p className="mt-4 font-display text-[15px] italic leading-snug text-[var(--ink)]">
        &ldquo;Why this university, and not one closer to home?&rdquo;
      </p>
      <Link
        href="/dashboard/mock-interview"
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-[10px] text-[13px] font-medium text-[var(--ink)] hover:border-[var(--line-hover)] transition-colors"
      >
        Try a practice question →
      </Link>
    </section>
  );
}
