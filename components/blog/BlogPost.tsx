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

type RelatedPost = { title: string; href: string };

type Props = {
  title: string;
  dek: string;
  publishedDate: string;
  intro: ReactNode;
  sections: Section[];
  related?: RelatedPost[];
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Article layout for /blog posts. Deliberately mirrors LegalPage's shape
 * (sticky ToC, H1 + H2 sections) so it reuses the same reading experience
 * and style tokens instead of introducing a new visual pattern.
 */
export function BlogPost({ title, dek, publishedDate, intro, sections, related }: Props) {
  const withIds = sections.map((s) => ({ ...s, id: s.id ?? slugify(s.heading) }));

  return (
    <>
      <Header />
      <main className="flex-1 pt-32 lg:pt-40">
        <article className="w-full bg-[var(--color-paper)] pb-24 lg:pb-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              ← All articles
            </Link>

            <div className="mt-6">
              <Eyebrow>Resources</Eyebrow>
              <h1 className="mt-4 font-display text-3xl sm:text-4xl tracking-tight leading-snug text-[var(--color-ink)]">
                {title}
              </h1>
              <p className="mt-4 text-base text-[var(--color-ink-soft)] leading-relaxed max-w-2xl">
                {dek}
              </p>
              <p className="mt-4 text-xs font-mono text-[var(--color-muted)]">
                Published {publishedDate}
              </p>
            </div>

            <div className="mt-10 border-t border-[var(--color-border)]" />

            <div className="mt-10 flex flex-col lg:flex-row lg:gap-12">
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

              <div className="flex-1 max-w-3xl">
                <div className="text-base leading-relaxed text-[var(--color-ink)]">
                  {intro}
                </div>

                <div className="mt-12 space-y-12">
                  {withIds.map((s) => (
                    <section key={s.id} id={s.id} style={{ scrollMarginTop: "120px" }}>
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
                  This article is educational information, not legal advice.
                  See the{" "}
                  <Link href="/disclaimer" className="text-[var(--color-ink)] hover:text-[var(--color-accent-deep)] transition-colors">
                    disclaimer
                  </Link>
                  .
                </div>

                {related && related.length > 0 ? (
                  <nav aria-label="Related articles" className="mt-8 flex flex-wrap gap-4 text-xs text-[var(--color-muted)]">
                    {related.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="hover:text-[var(--color-ink)] transition-colors"
                      >
                        {p.title} →
                      </Link>
                    ))}
                  </nav>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
