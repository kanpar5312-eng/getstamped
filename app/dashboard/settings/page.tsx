import type { Metadata } from "next";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { getSessionUser } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { getReferralStats } from "@/lib/referrals";
import { getFamilyState } from "@/lib/family";
import { getPriorRefusal } from "@/lib/prior-refusal";
import type { FamilySummary } from "@/components/settings/SettingsClient";

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

  // Best-effort — defaults to { priorRefusal: false, reason: null, ... }
  // if migration 0013_prior_refusal.sql hasn't been applied yet.
  const priorRefusal = sessionUser ? await getPriorRefusal(sessionUser.id) : null;

  const origin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN ??
    `https://${hdrs.get("host") ?? "getstamped.app"}`;

  let family: FamilySummary | undefined;
  if (sessionUser && profile.plan === "family") {
    const state = await getFamilyState(sessionUser.id);
    family =
      state.role === "none"
        ? // plan === "family" but no group row exists yet — nobody's been
          // invited. lib/family.ts creates the group lazily on first
          // invite, so this account IS the prospective owner; show them
          // as the sole seat so far, with open slots to invite into.
          {
            role: "owner",
            maxSeats: 2,
            seats: [{ userId: sessionUser.id, firstName: profile.firstName, isOwner: true, isYou: true }],
            pendingInvites: [],
          }
        : {
            role: state.role,
            maxSeats: state.maxSeats,
            seats: state.seats.map((s) => ({
              userId: s.userId,
              firstName: s.firstName,
              isOwner: s.isOwner,
              isYou: s.userId === sessionUser.id,
            })),
            pendingInvites: state.pendingInvites.map((i) => ({ id: i.id, email: i.email })),
          };
  }

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
      family={family}
      priorRefusalInitial={
        priorRefusal ? { priorRefusal: priorRefusal.priorRefusal, reason: priorRefusal.reason } : undefined
      }
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
