import { cookies } from "next/headers";
import type { Metadata } from "next";
import { MarketingLanding } from "@/components/landing/v3/MarketingLanding";
import { getWaitlistCount } from "@/app/actions/waitlist";
import type { Currency } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "GetStamped — The F-1 visa workspace",
  description:
    "47 ordered steps. AI document checks. Voice mock interviews. A view your parents can open. One workspace, until your visa is stamped.",
};

export default async function Home() {
  const { totalSignups, earlyBirdClaimed } = await getWaitlistCount();

  const c = await cookies();
  const stored = c.get("gs_currency")?.value;
  const currency: Currency = stored === "INR" ? "INR" : "USD";

  return (
    <MarketingLanding
      currency={currency}
      totalSignups={totalSignups}
      earlyBirdClaimed={earlyBirdClaimed}
    />
  );
}
