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
      bgImage="/sign-bg.png"
      eyebrow="Create account"
      title="Start free."
      subtitle="Phase 1 is unlocked forever. Upgrade only when you hit Phase 2."
      belowCard={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-[var(--color-persimmon-deep)] dark:text-[var(--color-persimmon)] underline underline-offset-4 decoration-2 hover:opacity-80 transition-opacity">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
