/**
 * Mock AI threads for the Ask page. Each thread holds a small message
 * history that drives the sidebar list and chat scroll area.
 */

export type Scope = "general" | "step" | "documents" | "interview";
export type Role = "user" | "assistant";

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
  helpful?: boolean | null;
  saved?: boolean;
};

export type Thread = {
  id: string;
  title: string;
  scope: Scope;
  stepNumber?: number;
  createdAt: Date;
  messages: Message[];
};

const NOW = new Date("2026-06-06T12:00:00Z");
const ago = (d: number) => new Date(NOW.getTime() - d * 86_400_000);

export const MOCK_THREADS: Thread[] = [
  {
    id: "t1",
    title: "Do I need a US bank statement?",
    scope: "documents",
    createdAt: ago(2),
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Do I need a US bank statement or only my home country one?",
        createdAt: ago(2),
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "For the F-1 interview, your **home country** bank statements are what the officer wants — they prove you can fund year 1. A US bank statement isn't required (you don't have one yet). Bring 6 months of statements from the account(s) covering tuition + living expenses. If parents are funding, bring **their** statements + a notarized affidavit of support.",
        createdAt: ago(2),
        helpful: true,
      },
    ],
  },
  {
    id: "t2",
    title: "What is a 221(g)?",
    scope: "general",
    createdAt: ago(5),
    messages: [
      { id: "m3", role: "user", content: "What is a 221(g) and how worried should I be?", createdAt: ago(5) },
      {
        id: "m4",
        role: "assistant",
        content:
          "A **221(g)** is administrative processing — not a denial. The officer needs more info or more time. Common triggers: missing documents, security background check, or your specific field/country combination. Average: 6 weeks. Respond to any document request promptly and the timeline shortens.",
        createdAt: ago(5),
      },
    ],
  },
  {
    id: "t3",
    title: "Can I work on F-1?",
    scope: "general",
    createdAt: ago(8),
    messages: [
      { id: "m5", role: "user", content: "What kind of work can I do on F-1?", createdAt: ago(8) },
      {
        id: "m6",
        role: "assistant",
        content:
          "On-campus only during your first academic year (20 hrs/week during term, full-time during breaks). Off-campus work requires CPT (during studies) or OPT (after) — both need DSO approval. Unauthorized work voids your visa.",
        createdAt: ago(8),
      },
    ],
  },
  {
    id: "t4",
    title: "How long does DS-160 take to process?",
    scope: "step",
    stepNumber: 21,
    createdAt: ago(14),
    messages: [
      {
        id: "m7", role: "user", content: "How long after submitting DS-160 can I book the appointment?",
        createdAt: ago(14),
      },
      {
        id: "m8", role: "assistant",
        content:
          "DS-160 submission is instant — you get the confirmation page with the barcode immediately. The bottleneck is the MRV fee payment, which takes 1–2 business days to clear before you can book the interview slot.",
        createdAt: ago(14),
      },
    ],
  },
  {
    id: "t5",
    title: "What if I have a gap year?",
    scope: "interview",
    createdAt: ago(20),
    messages: [
      {
        id: "m9", role: "user", content: "I took a gap year between high school and college. How do I explain it?",
        createdAt: ago(20),
      },
      {
        id: "m10", role: "assistant",
        content:
          "Honestly and specifically. Officers ask because gaps can hide work, military service, or denied visas. Have a 2-sentence answer ready: what you did, why, and how it relates to your plan. \"I worked at a renewable energy startup to confirm this is the field I want to pursue\" is strong. \"I just rested\" is not.",
        createdAt: ago(20),
      },
    ],
  },
];

export const SUGGESTED_QUESTIONS = [
  "How long does DS-160 take?",
  "What if I have a gap year?",
  "Can I work on F-1?",
  "What's a 221(g)?",
  "Do I need a US bank statement?",
  "What if my interview is in 2 weeks?",
  "How much funding is enough?",
  "Can I bring my spouse on F-2?",
];
