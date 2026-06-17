import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStudentFeedback } from "@/lib/feedback-data";
import { getSessionUser } from "@/lib/supabase/server";
import { FeedbackClient } from "@/components/feedback/FeedbackClient";

export const metadata: Metadata = {
  title: "Feedback — GetStamped",
  description: "Your visa readiness, scored.",
};

export default async function FeedbackPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const data = await getStudentFeedback();
  if (!data) {
    // Sign-in cleared mid-render or DB unavailable; redirect rather than
    // showing a half-broken page.
    redirect("/dashboard");
  }

  return <FeedbackClient data={data} />;
}
