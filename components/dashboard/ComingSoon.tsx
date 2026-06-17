import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Props = {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  bullets: string[];
};

export function ComingSoon({ eyebrow, title, subtitle, bullets }: Props) {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: eyebrow },
        ]}
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
      />

      <section className="mt-10 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-paper-soft)] p-8 sm:p-10">
        <Eyebrow>Shipping next</Eyebrow>
        <p className="mt-3 text-base text-[var(--color-ink)] max-w-xl leading-relaxed">
          This area is wired into the dashboard navigation but not yet built.
          When it ships, it will include:
        </p>
        <ul className="mt-5 space-y-2 max-w-xl">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-[var(--color-ink-soft)]"
            >
              <span
                aria-hidden
                className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[var(--color-persimmon)] shrink-0"
              />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-7">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
          >
            ← Back to overview
          </Link>
        </div>
      </section>
    </div>
  );
}
