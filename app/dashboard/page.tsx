import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { computeDashboard } from "@/lib/dashboard-state";
import { getCurrentUser } from "@/lib/current-user";
import { Block1Greeting } from "@/components/dashboard/Block1Greeting";
import { Block2NextStep } from "@/components/dashboard/Block2NextStep";
import { Block3Interview } from "@/components/dashboard/Block3Interview";
import { Block4QuickActions } from "@/components/dashboard/Block4QuickActions";
import { PhaseStepper } from "@/components/dashboard/PhaseStepper";
import { HorizonHeader } from "@/components/dashboard/HorizonHeader";
import { WhatsAheadCard } from "@/components/dashboard/WhatsAheadCard";
import { MockTeaserCard } from "@/components/dashboard/MockTeaserCard";
import { WeekOneStrip } from "@/components/dashboard/WeekOneStrip";
import { DevStateSwitcher } from "@/components/dashboard/DevStateSwitcher";

export const metadata: Metadata = {
  title: "Dashboard — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { profile, progress } = await getCurrentUser(params.state);
  const data = computeDashboard(profile, progress);

  if (data.state === "E") {
    redirect("/celebration");
  }

  const isStateA = data.state === "A";
  const isImminent = data.state === "D";

  return (
    <div className="dashboard-grid-shell mx-auto w-full max-w-[1140px]">
      <HorizonHeader>
        <PhaseStepper
          currentPhase={data.currentPhase}
          stepsComplete={data.stepsComplete}
        />
        <div className="mt-10">
          <Block1Greeting data={data} />
        </div>
      </HorizonHeader>

      {/* Body grid — 12 cols, 24px gutter */}
      <div className="mt-7 grid grid-cols-12 gap-x-6 gap-y-6">
        {isStateA ? (
          <>
            <div className="col-span-12 md:col-span-8">
              <Block2NextStep data={data} />
            </div>
            <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
              <WhatsAheadCard />
              <MockTeaserCard />
            </div>
            <div className="col-span-12">
              <WeekOneStrip progress={progress} nextStepNumber={data.nextStep?.number} />
            </div>
          </>
        ) : isImminent ? (
          <>
            <div className="col-span-12 md:col-span-8">
              <Block3Interview data={data} />
            </div>
            <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
              <Block2NextStep data={data} />
              <MockTeaserCard staggerIndex={4} />
            </div>
            <div className="col-span-12">
              <WeekOneStrip
                staggerIndex={5}
                items={[
                  { day: "Today", title: "Mock interview", icon: "mic" },
                  { day: "Tomorrow", title: "Documents review", icon: "doc" },
                  { day: "+2 days", title: "Common questions", icon: "user" },
                  { day: "+3 days", title: "Financial proof", icon: "money" },
                ]}
              />
            </div>
          </>
        ) : (
          <>
            <div className="col-span-12 md:col-span-8">
              <Block2NextStep data={data} />
            </div>
            <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
              <Block3Interview data={data} />
              <MockTeaserCard staggerIndex={4} />
            </div>
            <div className="col-span-12">
              <WeekOneStrip
                staggerIndex={5}
                progress={progress}
                nextStepNumber={data.nextStep?.number}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-10">
        <Block4QuickActions />
      </div>

      <DevStateSwitcher current={data.state} />
    </div>
  );
}
