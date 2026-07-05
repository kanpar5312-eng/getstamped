import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";
import { joinFamilyByToken, FAMILY_INVITE_COOKIE, FAMILY_INVITE_COOKIE_MAX_AGE } from "@/lib/family";
import { AuthShell } from "@/components/auth/AuthShell";

/* ════════════════════════════════════════════════════════════════════════
   /family/join/[token] — family plan invite landing.

   Signed-in visitor  → accept immediately, show a result screen.
   Signed-out visitor → set a 14-day cookie with the token and bounce to
                         sign-up; the signUp action reads the cookie via
                         attachFamilyInviteFromCookie() right after the
                         account is created. Same two-path shape as the
                         /r/<code> referral landing.
   ════════════════════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join family plan — GetStamped",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;

export default async function FamilyJoinPage({ params }: { params: Params }) {
  const { token } = await params;
  const clean = (token ?? "").trim();

  const user = await getSessionUser();

  if (!user) {
    const store = await cookies();
    store.set(FAMILY_INVITE_COOKIE, clean, {
      path: "/",
      maxAge: FAMILY_INVITE_COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: false,
    });
    redirect("/sign-up");
  }

  const result = await joinFamilyByToken(clean);

  return (
    <AuthShell
      eyebrow="Family plan"
      title={result.ok ? "You're in." : "This invite didn't work."}
      subtitle={
        result.ok
          ? "Your account now has full access — every phase, every step."
          : result.error
      }
    >
      <Link
        href={result.ok ? "/dashboard" : "/dashboard/settings"}
        className="block w-full text-center rounded-xl bg-[var(--color-persimmon)] px-5 py-3 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors"
      >
        {result.ok ? "Go to your dashboard" : "Back to settings"}
      </Link>
    </AuthShell>
  );
}
