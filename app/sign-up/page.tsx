import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create your account — GetStamped",
};

export default async function SignUpPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      background
      eyebrow="Create account"
      title="Start free."
      subtitle="Phase 1 is unlocked forever. Upgrade only when you hit Phase 2."
      belowCard={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-accent-deep)] transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
