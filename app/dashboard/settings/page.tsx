import type { Metadata } from "next";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { getSessionUser } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { getReferralStats } from "@/lib/referrals";

export const metadata: Metadata = {
  title: "Settings — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [{ profile }, sessionUser, hdrs] = await Promise.all([
    getCurrentUser(sp.state),
    getSessionUser(),
    headers(),
  ]);
  const referral = sessionUser
    ? await getReferralStats(sessionUser.id)
    : { code: null, totalReferred: 0, totalCompleted: 0, creditInrPaise: 0, creditUsdCents: 0 };

  const origin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN ??
    `https://${hdrs.get("host") ?? "getstamped.app"}`;

  return (
    <SettingsClient
      referral={{
        code: referral.code,
        link: referral.code ? `${origin}/r/${referral.code}` : null,
        totalReferred: referral.totalReferred,
        totalCompleted: referral.totalCompleted,
        creditInrPaise: referral.creditInrPaise,
        creditUsdCents: referral.creditUsdCents,
      }}
      initial={{
        firstName: profile.firstName,
        lastName: "Patel",
        email: sessionUser?.email ?? "arya.patel@example.com",
        country: "India",
        university: "North Carolina State University",
        intakeTerm: "Fall 2026",
        intakeDate: "2026-08-22",
        interviewDate: profile.interviewDate
          ? profile.interviewDate.toISOString().slice(0, 10)
          : "",
        consulate: profile.consulateLocation ?? "Mumbai",
        programType: "Master's",
        fundingSource: "Parents",
        plan: profile.plan,
      }}
    />
  );
}
