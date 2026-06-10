import type { ReactNode } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Crumb = { label: string; href?: string };

type Props = {
  crumbs: Crumb[];
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
};

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3 text-[var(--color-muted)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  subtitle,
  actions,
}: Props) {
  return (
    <header>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]"
      >
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="inline-flex items-center gap-1.5">
              {c.href && !isLast ? (
                <Link
                  href={c.href}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast ? "text-[var(--color-ink-soft)]" : undefined
                  }
                >
                  {c.label}
                </span>
              )}
              {!isLast && <ChevronRight />}
            </span>
          );
        })}
      </nav>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl leading-tight tracking-tight text-[var(--color-ink)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--color-ink-soft)]">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
