import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStepContent } from "@/lib/step-content";
import { stepByNumber, STEPS, TOTAL_STEPS } from "@/lib/steps";
import { getCurrentUser } from "@/lib/current-user";
import { buildTimelineView } from "@/lib/timeline-data";
import { StepDetailClient, type DocLiveStatus } from "@/components/step-detail/StepDetailClient";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { resolveDocumentSlug } from "@/lib/documents/slug-resolver";
import { DOCUMENT_CONSENT_VERSION } from "@/lib/documents/consent";

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

  // Manual verification / real document status — resolve each of this
  // step's document names to a canonical Document Vault slug (best
  // effort; unmatched items fall back to the old decorative toggle
  // untouched). For matched slugs, fetch the user's real row so the
  // Timeline shows the same AI-verified / Self-verified state as the
  // Document Vault instead of a fake local-only checkbox.
  const docSlugBySlot: (string | null)[] = got.content.documents.map((d) =>
    resolveDocumentSlug(d.name),
  );
  const relevantSlugs = Array.from(new Set(docSlugBySlot.filter((s): s is string => Boolean(s))));

  const docLiveStatus: Record<string, DocLiveStatus> = {};
  // DPDP Act compliance — same affirmative-consent gate the Document Vault
  // uses. Fetched here too since the Timeline page now uploads inline
  // (via /api/documents/upload) instead of only linking out to the vault.
  let consentGiven = false;
  const sb = await getServerSupabase();
  const sessionUser = await getSessionUser();
  if (sb && sessionUser) {
    const [{ data }, { data: profileRow }] = await Promise.all([
      relevantSlugs.length > 0
        ? sb
            .from("documents")
            .select("slug, status, verification_method")
            .eq("user_id", sessionUser.id)
            .in("slug", relevantSlugs)
            .is("deleted_at", null)
        : Promise.resolve({ data: null }),
      sb.from("profiles").select("document_consent_version").eq("id", sessionUser.id).maybeSingle(),
    ]);
    for (const row of data ?? []) {
      docLiveStatus[row.slug] = {
        status: row.status,
        verificationMethod:
          row.verification_method ?? (row.status === "accepted" ? "ai" : null),
      };
    }
    consentGiven = profileRow?.document_consent_version === DOCUMENT_CONSENT_VERSION;
  }

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
        docSlugBySlot={docSlugBySlot}
        docLiveStatus={docLiveStatus}
        consentGiven={consentGiven}
      />
    </div>
  );
}
