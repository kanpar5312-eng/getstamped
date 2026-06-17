import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { MockInterviewClient } from "@/components/mock-interview/MockInterviewClient";

export const metadata: Metadata = {
  title: "Mock Interview — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function MockInterviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { profile } = await getCurrentUser(sp.state);
  return (
    <MockInterviewClient
      plan={profile.plan}
      consulate={profile.consulateLocation ?? null}
    />
  );
}
