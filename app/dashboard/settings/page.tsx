import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { getSessionUser } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/SettingsClient";

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
  const { profile } = await getCurrentUser(sp.state);
  const sessionUser = await getSessionUser();

  return (
    <SettingsClient
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
