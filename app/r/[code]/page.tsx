import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE } from "@/lib/referrals";

/* ════════════════════════════════════════════════════════════════════════
   /r/[code] — referral landing.
   Sets a 90-day cookie with the referrer's code, then bounces straight to
   sign-up. The signUp server action reads the cookie and creates a
   pending referrals row once the new user exists.

   We don't validate the code here (cheap to skip — bad codes just expire
   harmlessly during attribution). Lower-cases for storage consistency.
   ════════════════════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";

type Params = Promise<{ code: string }>;

export default async function ReferralLanding({ params }: { params: Params }) {
  const { code } = await params;
  const clean = (code ?? "").trim().toUpperCase().slice(0, 12);

  if (clean) {
    const store = await cookies();
    store.set(REFERRAL_COOKIE, clean, {
      path: "/",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: false, // safe to expose; not a session token
    });
  }

  redirect("/sign-up");
}
