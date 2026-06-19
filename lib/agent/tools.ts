/* ════════════════════════════════════════════════════════════════════════════
   Agent tools — the things the AI in the AskPanel is allowed to *do* on the
   user's behalf. Each tool has:

   • A JSON-schema definition the LLM sees (Groq tool calling format).
   • A `kind` discriminator the client uses to render its confirmation card.
   • An execute() the /api/agent/confirm endpoint runs after the user clicks
     "Yes" — never before. Navigation is the one exception (no DB write, so
     the client just routes after confirmation).

   Anything sensitive (DB writes, money, anything irreversible) MUST go
   through the confirm endpoint. Do not add a tool that mutates state in the
   chat endpoint.
   ═════════════════════════════════════════════════════════════════════════ */

import { STEPS, TOTAL_STEPS } from "@/lib/steps";

export type AgentRoute =
  | "/dashboard"
  | "/dashboard/documents"
  | "/dashboard/mock-interview"
  | "/dashboard/ask"
  | "/dashboard/settings"
  | "/dashboard/feedback"
  | "/dashboard/upgrade"
  | "/dashboard/parent-view"
  | "/dashboard/timeline"
  | `/dashboard/timeline/${number}`;

export type AgentAction =
  | { kind: "navigate"; to: AgentRoute; summary: string }
  | { kind: "mark_step_done"; stepNumber: number; stepTitle: string; summary: string }
  | { kind: "set_interview_date"; dateISO: string; summary: string };

/* ── LLM-facing tool schemas (OpenAI/Groq tool-calling format) ── */
export const AGENT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "navigate",
      description:
        "Navigate the user to a section of their dashboard. Use when the user says 'go to', 'open', 'take me to', or asks to see a page. Prefer this over describing where to click.",
      parameters: {
        type: "object",
        properties: {
          destination: {
            type: "string",
            description:
              "Which area to open. Use 'step' with stepNumber when the user names a specific step.",
            enum: [
              "dashboard",
              "documents",
              "mock_interview",
              "ask",
              "settings",
              "feedback",
              "upgrade",
              "parent_share",
              "timeline",
              "step",
            ],
          },
          stepNumber: {
            type: "integer",
            description: "1..47 — required only when destination is 'step'.",
            minimum: 1,
            maximum: TOTAL_STEPS,
          },
        },
        required: ["destination"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "mark_step_done",
      description:
        "Mark one of the 47 F-1 prep steps as complete for the signed-in user. Use ONLY when the user says they finished, did, or completed a step. Do not call this preemptively.",
      parameters: {
        type: "object",
        properties: {
          stepNumber: {
            type: "integer",
            description: "Which step to mark complete (1..47).",
            minimum: 1,
            maximum: TOTAL_STEPS,
          },
        },
        required: ["stepNumber"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "set_interview_date",
      description:
        "Save the user's F-1 visa interview date to their profile. Use when the user tells you the date their interview is scheduled for. Accept natural language and convert to ISO date.",
      parameters: {
        type: "object",
        properties: {
          dateISO: {
            type: "string",
            description:
              "Interview date in ISO YYYY-MM-DD format. Convert any phrasing ('July 8', 'next Friday') to a calendar date before calling.",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          },
        },
        required: ["dateISO"],
      },
    },
  },
] as const;

/* ── Validation: turn a raw tool call into a typed AgentAction or null. ── */

const ROUTE_MAP: Record<string, AgentRoute> = {
  dashboard: "/dashboard",
  documents: "/dashboard/documents",
  mock_interview: "/dashboard/mock-interview",
  ask: "/dashboard/ask",
  settings: "/dashboard/settings",
  feedback: "/dashboard/feedback",
  upgrade: "/dashboard/upgrade",
  parent_share: "/dashboard/parent-view",
  timeline: "/dashboard/timeline",
};

export function buildAction(
  name: string,
  args: Record<string, unknown>,
): AgentAction | null {
  if (name === "navigate") {
    const dest = String(args.destination ?? "");
    if (dest === "step") {
      const n = Number(args.stepNumber);
      if (!Number.isInteger(n) || n < 1 || n > TOTAL_STEPS) return null;
      const step = STEPS.find((s) => s.number === n);
      return {
        kind: "navigate",
        to: `/dashboard/timeline/${n}` as AgentRoute,
        summary: `Open Step ${n}${step ? ` — ${step.title}` : ""}`,
      };
    }
    const to = ROUTE_MAP[dest];
    if (!to) return null;
    const labels: Record<string, string> = {
      dashboard: "your dashboard",
      documents: "Document Vault",
      mock_interview: "Mock Interview",
      ask: "the Ask page",
      settings: "Settings",
      feedback: "Feedback",
      upgrade: "Pricing & upgrade",
      parent_share: "Parent Share",
      timeline: "your 47-step Timeline",
    };
    return { kind: "navigate", to, summary: `Open ${labels[dest] ?? dest}` };
  }

  if (name === "mark_step_done") {
    const n = Number(args.stepNumber);
    if (!Number.isInteger(n) || n < 1 || n > TOTAL_STEPS) return null;
    const step = STEPS.find((s) => s.number === n);
    return {
      kind: "mark_step_done",
      stepNumber: n,
      stepTitle: step?.title ?? `Step ${n}`,
      summary: `Mark Step ${n} (${step?.title ?? "—"}) complete`,
    };
  }

  if (name === "set_interview_date") {
    const d = String(args.dateISO ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
    const parsed = new Date(d + "T00:00:00Z");
    if (Number.isNaN(parsed.getTime())) return null;
    const pretty = parsed.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    return {
      kind: "set_interview_date",
      dateISO: d,
      summary: `Save your visa interview date: ${pretty}`,
    };
  }

  return null;
}
