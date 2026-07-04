import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { computePlannerView } from "@/lib/timeline-planner";
import { TimelinePlannerClient } from "@/components/timeline-planner/TimelinePlannerClient";

export const metadata: Metadata = {
  title: "Timeline Planner — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function TimelinePlannerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { profile, progress } = await getCurrentUser(params.state);

  const now = new Date();
  const view = computePlannerView(profile, progress, now);

  return (
    <div className="mx-auto max-w-4xl">
      <TimelinePlannerClient
        view={view}
        today={now}
        profile={{
          interviewDate: profile.interviewDate,
          consulateLocation: profile.consulateLocation,
          interviewTimeOfDay: profile.interviewTimeOfDay,
        }}
      />
    </div>
  );
}
