import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "F-1 Visa Resources & Guides | GetStamped Blog",
  description:
    "Factual, step-by-step guides for the F-1 student visa process: interview questions, DS-160 mistakes to avoid, and the SEVIS fee payment guide.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "F-1 Visa Resources & Guides",
    description:
      "Factual, step-by-step guides for the F-1 student visa process.",
    url: "/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "F-1 Visa Resources & Guides",
    description: "Factual, step-by-step guides for the F-1 student visa process.",
  },
};

const POSTS = [
  {
    title: "F-1 Visa Interview Questions 2026",
    href: "/blog/f1-visa-interview-questions-2026",
    description:
      "The F-1 visa interview questions consular officers ask most often, grouped by category, with what a strong answer sounds like for each one.",
  },
  {
    title: "DS-160 Common Mistakes to Avoid",
    href: "/blog/ds-160-common-mistakes",
    description:
      "The most common DS-160 mistakes that delay or complicate F-1 visa applications — from mismatched names to wrong SEVIS numbers.",
  },
  {
    title: "SEVIS Fee Payment Guide",
    href: "/blog/sevis-fee-payment-guide",
    description:
      "How to pay the SEVIS I-901 fee for an F-1 visa: when to pay it, what you need first, and how to keep proof of payment.",
  },
];

export default function BlogIndexPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-32 lg:pt-40 pb-24 lg:pb-32 bg-[var(--color-paper)]">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
          <Eyebrow>Resources</Eyebrow>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[var(--color-ink)]">
            F-1 visa guides
          </h1>
          <p className="mt-4 text-base text-[var(--color-ink-soft)] leading-relaxed max-w-2xl">
            Factual, step-by-step guides for parts of the F-1 process that
            cause the most confusion — written the same way GetStamped
            sequences its 47-step checklist.
          </p>

          <ul className="mt-12 space-y-8 max-w-2xl">
            {POSTS.map((post) => (
              <li key={post.href} className="border-t border-[var(--color-border)] pt-8">
                <Link
                  href={post.href}
                  className="font-display text-2xl tracking-tight text-[var(--color-ink)] hover:text-[var(--color-accent-deep)] transition-colors"
                >
                  {post.title}
                </Link>
                <p className="mt-3 text-sm text-[var(--color-ink-soft)] leading-relaxed">
                  {post.description}
                </p>
                <Link
                  href={post.href}
                  className="mt-3 inline-block text-xs text-[var(--color-accent-deep)] hover:underline underline-offset-2"
                >
                  Read more →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
