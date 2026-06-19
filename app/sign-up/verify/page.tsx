import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";

export const metadata: Metadata = {
  title: "Verify your email — GetStamped",
};

type SearchParams = Promise<{ email?: string }>;

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const email = sp.email?.trim();
  if (!email) redirect("/sign-up");

  return (
    <AuthShell
      eyebrow="One last step"
      title="Verify your email."
      subtitle="We sent a 6-digit code to confirm it's really you."
      belowCard={
        <>
          Wrong address?{" "}
          <Link
            href="/sign-up"
            className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-persimmon-deep)] transition-colors"
          >
            Start over
          </Link>
        </>
      }
    >
      <VerifyCodeForm email={email} />
    </AuthShell>
  );
}
