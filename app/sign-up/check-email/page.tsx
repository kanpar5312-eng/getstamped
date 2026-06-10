import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Check your email — GetStamped",
};

type SearchParams = Promise<{ email?: string }>;

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const email = sp.email ?? "your inbox";

  return (
    <AuthShell
      eyebrow="One more step"
      title="Check your email."
      subtitle={`We sent a verification link to ${email}. Click it to finish setup.`}
      belowCard={
        <>
          Wrong address?{" "}
          <Link href="/sign-up" className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-accent-deep)] transition-colors">
            Start over
          </Link>
        </>
      }
    >
      <ol className="space-y-3 text-sm text-[var(--color-ink-soft)] leading-relaxed">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] text-xs font-medium">1</span>
          <span>Open the email from <span className="font-medium text-[var(--color-ink)]">no-reply@getstamped.app</span> (check spam if it&rsquo;s not in your inbox).</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] text-xs font-medium">2</span>
          <span>Click <span className="font-medium text-[var(--color-ink)]">Verify email address</span>.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] text-xs font-medium">3</span>
          <span>You&rsquo;ll be dropped straight into your dashboard.</span>
        </li>
      </ol>
      <div className="mt-6 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-cream)] p-3 text-xs text-[var(--color-muted)] leading-relaxed">
        The verification link expires in 24 hours. If it does, you can{" "}
        <Link href="/sign-in" className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-accent-deep)] transition-colors">
          sign in
        </Link>{" "}
        to request a fresh one.
      </div>
    </AuthShell>
  );
}
