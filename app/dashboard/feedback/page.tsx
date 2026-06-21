import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStudentFeedback } from "@/lib/feedback-data";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { FeedbackClient } from "@/components/feedback/FeedbackClient";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";

export const metadata: Metadata = {
  title: "Feedback — GetStamped",
  description: "Your visa readiness, scored.",
};

export default async function FeedbackPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  // Free tier doesn't get the feedback page. Render the paywall in
  // place of the data fetch so we never leak readiness internals.
  const sb = await getServerSupabase();
  const { data: prof } = sb
    ? await sb.from("profiles").select("plan").eq("id", user.id).maybeSingle()
    : { data: null };
  const plan = (prof?.plan as "free" | "solo" | "family" | undefined) ?? "free";
  if (plan === "free") {
    return (
      <div className="mx-auto max-w-2xl py-20 px-4">
        <PaywallOverlay type="upgrade" feature="Feedback" />
      </div>
    );
  }

  const data = await getStudentFeedback();
  if (!data) {
    // Sign-in cleared mid-render or DB unavailable; redirect rather than
    // showing a half-broken page.
    redirect("/dashboard");
  }

  return <FeedbackClient data={data} />;
}
