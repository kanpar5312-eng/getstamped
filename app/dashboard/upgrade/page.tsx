import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { getWaitlistCount } from "@/app/actions/waitlist";
import { UpgradeClient } from "@/components/dashboard/UpgradeClient";

export const metadata: Metadata = {
  title: "Upgrade — GetStamped",
};

type SearchParams = Promise<{ state?: string; plan?: string }>;

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { profile } = await getCurrentUser(sp.state);
  const { earlyBirdClaimed } = await getWaitlistCount();
  const earlyBirdRemaining = Math.max(0, 100 - earlyBirdClaimed);

  return (
    <UpgradeClient
      currentPlan={profile.plan}
      earlyBirdRemaining={earlyBirdRemaining}
    />
  );
}
