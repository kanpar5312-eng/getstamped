/**
 * Merges a universal `Step` (lib/steps.ts) with any country-specific
 * overrides (lib/steps-overrides.ts) for a given home country, so every
 * consumer — the dashboard panel, AI context builders, the dev content
 * status page — resolves country content the same way.
 *
 * Every resolved text field reports whether it was overridden, so the UI
 * can badge exactly the overridden fragment rather than the whole step.
 */

import type { Step } from "@/lib/steps";
import type { HomeCountryCode } from "@/lib/home-countries";
import {
  STEP_OVERRIDES,
  STEP_CONTENT_STATUS,
  type StepOverridePath,
  type StepOverridePatch,
} from "@/lib/steps-overrides";

export type ResolvedField = { text: string; overridden: boolean };

export type ResolvedStep = {
  step: Step;
  homeCountry: HomeCountryCode | null;
  shortDescription: ResolvedField;
  instructions: {
    intro: ResolvedField;
    steps: {
      title: string;
      body: ResolvedField;
      link?: { label: string; url: string };
      linkOverridden: boolean;
    }[];
    outro?: ResolvedField;
  };
  documents: {
    key: string;
    name: string;
    description: ResolvedField;
    expiryRelevant?: boolean;
  }[];
  commonMistakes: {
    title: string;
    titleOverridden: boolean;
    body: ResolvedField;
  }[];
  officialSources: { label: string; url: string; overridden: boolean }[];
  whyItMatters: string;
  contentStatus: "verified" | "universal";
};

function pathEq(a: StepOverridePath, b: StepOverridePath): boolean {
  if (a.field !== b.field) return false;
  const ai = "index" in a ? a.index : undefined;
  const bi = "index" in b ? b.index : undefined;
  return ai === bi;
}

function findPatch(
  country: HomeCountryCode | null,
  stepNumber: number,
  path: StepOverridePath,
): StepOverridePatch | undefined {
  if (!country) return undefined;
  return STEP_OVERRIDES.find(
    (o) => o.stepNumber === stepNumber && o.country === country && pathEq(o.path, path),
  )?.patch;
}

export function resolveStepContent(step: Step, homeCountry: HomeCountryCode | null): ResolvedStep {
  const find = (path: StepOverridePath) => findPatch(homeCountry, step.number, path);

  const shortDescPatch = find({ field: "shortDescription" });
  const introPatch = find({ field: "instructions.intro" });
  const outroPatch = step.instructions.outro ? find({ field: "instructions.outro" }) : undefined;

  const instructionSteps = step.instructions.steps.map((s, i) => {
    const patch = find({ field: "instructions.steps", index: i });
    const linkOverridden = Boolean(patch?.label || patch?.url);
    const link = linkOverridden
      ? { label: patch?.label ?? s.link?.label ?? "", url: patch?.url ?? s.link?.url ?? "" }
      : s.link;
    return {
      title: s.title,
      body: { text: patch?.body ?? s.body, overridden: Boolean(patch?.body) },
      link,
      linkOverridden,
    };
  });

  const commonMistakes = step.commonMistakes.map((m, i) => {
    const patch = find({ field: "commonMistakes", index: i });
    return {
      title: patch?.title ?? m.title,
      titleOverridden: Boolean(patch?.title),
      body: { text: patch?.body ?? m.body, overridden: Boolean(patch?.body) },
    };
  });

  const documents = step.documents.map((d, i) => {
    const patch = find({ field: "documents", index: i });
    return {
      key: d.key,
      name: d.name,
      description: { text: patch?.description ?? d.description, overridden: Boolean(patch?.description) },
      expiryRelevant: d.expiryRelevant,
    };
  });

  const officialSources = step.officialSources.map((src, i) => {
    const patch = find({ field: "officialSources", index: i });
    return {
      label: patch?.label ?? src.label,
      url: patch?.url ?? src.url,
      overridden: Boolean(patch?.label || patch?.url),
    };
  });

  return {
    step,
    homeCountry,
    shortDescription: {
      text: shortDescPatch?.shortDescription ?? step.shortDescription,
      overridden: Boolean(shortDescPatch?.shortDescription),
    },
    instructions: {
      intro: { text: introPatch?.intro ?? step.instructions.intro, overridden: Boolean(introPatch?.intro) },
      steps: instructionSteps,
      outro: step.instructions.outro
        ? { text: outroPatch?.outro ?? step.instructions.outro, overridden: Boolean(outroPatch?.outro) }
        : undefined,
    },
    documents,
    commonMistakes,
    officialSources,
    whyItMatters: step.whyItMatters,
    contentStatus: (homeCountry && STEP_CONTENT_STATUS[step.number]?.[homeCountry]) ?? "universal",
  };
}
