import type { Metadata } from "next";
import { getSessionUser } from "@/lib/supabase/server";
import { getUniversityFitQuiz } from "@/lib/university-fit";
import { UniversityFitClient } from "@/components/university-fit/UniversityFitClient";

export const metadata: Metadata = {
  title: "University fit — GetStamped",
};

export default async function UniversityFitPage() {
  const sessionUser = await getSessionUser();
  // Best-effort — defaults to an empty quiz if migration
  // 0014_university_fit.sql hasn't been applied yet, or the user hasn't
  // filled it in before. Either way the page renders the form.
  const initial = sessionUser
    ? await getUniversityFitQuiz(sessionUser.id)
    : {
        intendedField: null,
        targetDegreeLevel: null,
        budgetCeilingUsd: null,
        academicScores: null,
        careerGoal: null,
        completedAt: null,
      };

  return (
    <div className="mx-auto max-w-3xl">
      <UniversityFitClient initial={initial} />
    </div>
  );
}
