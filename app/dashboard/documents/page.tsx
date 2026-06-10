import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { DocumentsClient } from "@/components/documents/DocumentsClient";

export const metadata: Metadata = {
  title: "Documents — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { profile } = await getCurrentUser(sp.state);
  return <DocumentsClient plan={profile.plan} />;
}
