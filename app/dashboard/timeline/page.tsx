import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { buildTimelineView } from "@/lib/timeline-data";
import { TimelineClient } from "@/components/timeline/TimelineClient";
import type { Currency } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Timeline — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { profile, progress } = await getCurrentUser(params.state);

  const c = await cookies();
  const stored = c.get("gs_currency")?.value;
  const currency: Currency = stored === "INR" ? "INR" : "USD";

  const view = buildTimelineView(profile, progress, currency);

  return (
    <div className="mx-auto max-w-6xl">
      <TimelineClient view={view} />
    </div>
  );
}
