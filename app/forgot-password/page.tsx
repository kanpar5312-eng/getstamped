import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = {
  title: "Reset your password — GetStamped",
  description:
    "Reset your GetStamped account password. Enter your email and we'll send a secure reset link.",
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      title="Reset your password."
      subtitle="Enter the email on your account. We'll send you a reset link."
      belowCard={
        <>
          Remembered it?{" "}
          <Link href="/sign-in" className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-tg-deep)] transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
