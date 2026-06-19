import "server-only";
import Groq from "groq-sdk";

/**
 * Server-side Groq client + system prompt builder.
 * Reads GROQ_API_KEY from env; throws if missing on first use.
 */
let cached: Groq | null = null;

export function getGroq(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (cached) return cached;
  cached = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return cached;
}

const SYSTEM_BASE = `You are Vera, GetStamped's in-house guide for international students applying for the US F-1 student visa. You are calm, exacting, and direct — the experienced friend who has walked dozens of students through their interviews.

Hard rules:
- Your name is Vera. If asked, you say so plainly: "I'm Vera." You never say "I'm an AI," "I'm a language model," or "I'm just a bot." You are GetStamped's guide.
- Be specific. Cite document names ("DS-160", "I-20", "SEVIS I-901", "DS-2019" for J-1), consulates, fees in USD/INR, and timelines in weeks.
- Be concise. 2–4 short paragraphs max. Use **bold** for the answer's key fact. Use \`code\` style for form names, fee amounts, and exact text the officer asks for.
- When relevant, mention the specific consulate quirks the student likely faces (Mumbai vs Chennai vs Hyderabad vs São Paulo vs Lagos vs Manila).
- NEVER hallucinate fees, processing windows, or policy. If you are not sure, say so and direct the student to travel.state.gov.
- NEVER promise visa approval — frame everything as preparation that maximizes the student's chance.`;

export function buildSystemPrompt(opts: {
  scope?: "general" | "step" | "documents" | "interview";
  stepNumber?: number;
  stepTitle?: string;
  profile?: {
    country?: string | null;
    university?: string | null;
    consulate?: string | null;
    program_type?: string | null;
    intake_term?: string | null;
  };
}): string {
  const parts: string[] = [SYSTEM_BASE];

  if (opts.profile) {
    const p = opts.profile;
    const facts = [
      p.country ? `Passport: ${p.country}` : null,
      p.university ? `University: ${p.university}` : null,
      p.consulate ? `Consulate: ${p.consulate}` : null,
      p.program_type ? `Program: ${p.program_type}` : null,
      p.intake_term ? `Intake: ${p.intake_term}` : null,
    ].filter(Boolean);
    if (facts.length) {
      parts.push(`Student context (use sparingly, only if relevant):\n${facts.join("\n")}`);
    }
  }

  if (opts.scope === "step" && opts.stepNumber) {
    parts.push(
      `The student is asking about Step ${opts.stepNumber}${opts.stepTitle ? ` — ${opts.stepTitle}` : ""}. ` +
        `Scope your answer to that specific step.`,
    );
  } else if (opts.scope === "documents") {
    parts.push(`The student is asking about documents required for the F-1 process. Focus on document specs, formats, and what officers actually verify.`);
  } else if (opts.scope === "interview") {
    parts.push(`The student is asking about the visa interview. Focus on officer behavior, typical questions, body language, and answer strategy.`);
  }

  return parts.join("\n\n");
}

export const GROQ_MODEL = "llama-3.1-8b-instant";
