import type { ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Eyebrow } from "@/components/ui/Eyebrow";

export type Section = {
  id?: string;
  heading: string;
  body: ReactNode;
};

type Props = {
  title: string;
  effectiveDate: string;
  intro: ReactNode;
  sections: Section[];
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const OTHER_PAGES = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund", href: "/refund" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "DPA", href: "/dpa" },
];

export function LegalPage({ title, effectiveDate, intro, sections }: Props) {
  const withIds = sections.map((s) => ({ ...s, id: s.id ?? slugify(s.heading) }));

  return (
    <>
      <Header />
      <main className="flex-1 pt-32 lg:pt-40">
        <article className="w-full bg-[var(--color-cream)] pb-24 lg:pb-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              ← Back
            </Link>

            <div className="mt-6">
              <Eyebrow>Legal</Eyebrow>
              <h1 className="mt-4 font-display text-3xl sm:text-4xl tracking-tight leading-snug text-[var(--color-ink)]">
                {title}
              </h1>
              <p className="mt-4 text-xs font-mono text-[var(--color-muted)]">
                Effective {effectiveDate}
              </p>
            </div>

            <div className="mt-10 border-t border-[var(--color-border)]" />

            <div className="mt-10 flex flex-col lg:flex-row lg:gap-12">
              {/* Sticky ToC */}
              <aside className="hidden lg:block w-[220px] shrink-0">
                <nav aria-label="On this page" className="sticky top-32">
                  <Eyebrow>On this page</Eyebrow>
                  <ul className="mt-4 space-y-2">
                    {withIds.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-accent-deep)] transition-colors leading-relaxed"
                        >
                          {s.heading}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>

              {/* Article */}
              <div className="flex-1 max-w-3xl">
                <div className="text-base leading-relaxed text-[var(--color-ink)]">
                  {intro}
                </div>

                <div className="mt-12 space-y-12">
                  {withIds.map((s) => (
                    <section
                      key={s.id}
                      id={s.id}
                      style={{ scrollMarginTop: "120px" }}
                    >
                      <h2 className="font-display text-xl sm:text-2xl leading-snug tracking-tight text-[var(--color-ink)]">
                        {s.heading}
                      </h2>
                      <div className="mt-4 text-base leading-relaxed text-[var(--color-ink)] space-y-4">
                        {s.body}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="mt-16 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted)]">
                  Questions? Email{" "}
                  <a
                    href="mailto:hello@getstamped.app"
                    className="text-[var(--color-ink)] hover:text-[var(--color-accent-deep)] transition-colors"
                  >
                    hello@getstamped.app
                  </a>
                  .
                </div>

                {/* Inter-page nav */}
                <nav aria-label="Other legal pages" className="mt-8 flex flex-wrap gap-4 text-xs text-[var(--color-muted)]">
                  {OTHER_PAGES.filter((p) => p.label.toLowerCase() !== title.toLowerCase().replace(/\s+policy$/i, "").trim()).map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      className="hover:text-[var(--color-ink)] transition-colors"
                    >
                      {p.label} →
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
