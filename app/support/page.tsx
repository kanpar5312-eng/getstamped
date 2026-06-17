import type { Metadata } from "next";
import { getSessionUser } from "@/lib/supabase/server";
import { SupportClient } from "@/components/support/SupportClient";

export const metadata: Metadata = {
  title: "Support — GetStamped",
  description: "Answers to common F-1 visa and GetStamped questions.",
};

export default async function SupportPage() {
  // Lightweight session check — no profile fetch needed, just yes/no.
  const user = await getSessionUser();
  return <SupportClient isAuthed={Boolean(user)} />;
}
