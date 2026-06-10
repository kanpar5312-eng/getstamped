import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStepContent } from "@/lib/step-content";
import { stepByNumber, STEPS, TOTAL_STEPS } from "@/lib/steps";
import { getCurrentUser } from "@/lib/current-user";
import { buildTimelineView } from "@/lib/timeline-data";
import { StepDetailClient } from "@/components/step-detail/StepDetailClient";

type SearchParams = Promise<{ state?: string }>;
type Params = Promise<{ stepNumber: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { stepNumber } = await params;
  const step = stepByNumber(parseInt(stepNumber, 10));
  if (!step) return { title: "Step — GetStamped" };
  return { title: `Step ${step.number} · ${step.title} — GetStamped` };
}

export default async function StepDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { stepNumber } = await params;
  const n = parseInt(stepNumber, 10);
  if (!Number.isFinite(n) || n < 1 || n > TOTAL_STEPS) notFound();

  const sp = await searchParams;
  const { profile, progress } = await getCurrentUser(sp.state);

  const got = getStepContent(n);
  if (!got) notFound();

  const view = buildTimelineView(profile, progress);
  const stepView = view.phases
    .flatMap((p) => p.steps)
    .find((sv) => sv.step.number === n);
  const status = stepView?.status ?? "available";

  const phase = view.phases.find((p) => p.number === got.step.phase);
  const phaseCompleted = phase?.completed ?? 0;
  const phaseTotal = phase?.total ?? 0;

  const prevStep = n > 1 ? STEPS[n - 2] : null;
  const nextStep = n < TOTAL_STEPS ? STEPS[n] : null;

  return (
    <div className="mx-auto max-w-6xl">
      <StepDetailClient
        step={got.step}
        content={got.content}
        initialStatus={status}
        prevStep={prevStep}
        nextStep={nextStep}
        phaseCompleted={phaseCompleted}
        phaseTotal={phaseTotal}
      />
    </div>
  );
}
