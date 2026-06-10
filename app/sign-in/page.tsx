import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in — GetStamped",
};

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      background
      eyebrow="Sign in"
      title="Welcome back."
      subtitle="Pick up where you left off."
      belowCard={
        <>
          New here?{" "}
          <Link href="/sign-up" className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-accent-deep)] transition-colors">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
