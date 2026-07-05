import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
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

  return <UpgradeClient currentPlan={profile.plan} />;
}
