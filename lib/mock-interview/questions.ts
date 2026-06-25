/* ════════════════════════════════════════════════════════════════════════
   Mock interview question pool + per-session selector.
   ──────────────────────────────────────────────────────────────────────
   • 75 questions, grouped into six categories that mirror what consular
     officers actually grade. Each carries a stable `id`, the prompt
     `text`, its `category`, and the `difficulty` band it belongs to.
   • `selectQuestions()` runs once per session: it Fisher-Yates shuffles
     the pool, then draws under per-mode + per-consulate weights so no
     two sessions read the same.
   • Strict mode guarantees 2–3 follow-up / harder variants AND injects a
     financial follow-up directly after each financial question.
   • Mumbai / Hyderabad / Chennai consulates skew toward financial proof
     since they historically probe funding harder than other posts.

   This module is pure (no React, no side effects) so it's safe to import
   from server routes too if we ever want to seed Groq prompts with the
   same pool.
   ═════════════════════════════════════════════════════════════════════════ */

export type QuestionCategory =
  | "study_plan"
  | "financial"
  | "ties"
  | "post_study"
  | "general"
  | "follow_up";

export type QuestionDifficulty = "standard" | "strict";

export type Question = {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
};

/* ────────────────────────────────────────────────────────────── pool ── */

export const QUESTION_POOL: Question[] = [
  // ─── 1. Study plan & university choice (15) ───────────────────────────
  { id: "sp-01", category: "study_plan", difficulty: "standard", text: "Why this university over the others that admitted you?" },
  { id: "sp-02", category: "study_plan", difficulty: "standard", text: "What's your major and why did you choose it?" },
  { id: "sp-03", category: "study_plan", difficulty: "standard", text: "How did you choose your major specifically?" },
  { id: "sp-04", category: "study_plan", difficulty: "standard", text: "What program rank, lab, or faculty drew you to this school?" },
  { id: "sp-05", category: "study_plan", difficulty: "standard", text: "Describe your campus's strengths in one sentence." },
  { id: "sp-06", category: "study_plan", difficulty: "standard", text: "Which other US universities did you apply to, and why this one?" },
  { id: "sp-07", category: "study_plan", difficulty: "standard", text: "Why this specific city or state for your studies?" },
  { id: "sp-08", category: "study_plan", difficulty: "standard", text: "Which professors or research groups interest you at this school?" },
  { id: "sp-09", category: "study_plan", difficulty: "standard", text: "How does this program align with your undergraduate work?" },
  { id: "sp-10", category: "study_plan", difficulty: "standard", text: "What unique courses does this program offer that others don't?" },
  { id: "sp-11", category: "study_plan", difficulty: "standard", text: "Were you admitted to any program in your home country? Why not those?" },
  { id: "sp-12", category: "study_plan", difficulty: "standard", text: "Walk me through the academic structure of your program." },
  { id: "sp-13", category: "study_plan", difficulty: "standard", text: "What's the duration of your program and when do you expect to graduate?" },
  { id: "sp-14", category: "study_plan", difficulty: "standard", text: "Why pursue a Master's now instead of working first?" },
  { id: "sp-15", category: "study_plan", difficulty: "standard", text: "How did you first hear about this program?" },

  // ─── 2. Financial proof & sponsor (15) ────────────────────────────────
  { id: "fn-01", category: "financial", difficulty: "standard", text: "Who is funding your education?" },
  { id: "fn-02", category: "financial", difficulty: "standard", text: "What is your total estimated cost of attendance?" },
  { id: "fn-03", category: "financial", difficulty: "standard", text: "How does your sponsor plan to pay tuition and living expenses?" },
  { id: "fn-04", category: "financial", difficulty: "standard", text: "What is your sponsor's annual income?" },
  { id: "fn-05", category: "financial", difficulty: "standard", text: "What is your sponsor's profession or business?" },
  { id: "fn-06", category: "financial", difficulty: "standard", text: "How long has your sponsor been in their current job or business?" },
  { id: "fn-07", category: "financial", difficulty: "standard", text: "Have you taken any education loan? From which bank and for how much?" },
  { id: "fn-08", category: "financial", difficulty: "standard", text: "How much liquid money do you have available today?" },
  { id: "fn-09", category: "financial", difficulty: "standard", text: "What's your monthly living cost estimate in the US?" },
  { id: "fn-10", category: "financial", difficulty: "standard", text: "Is your sponsor's income enough to cover tuition AND living expenses?" },
  { id: "fn-11", category: "financial", difficulty: "standard", text: "Are any family assets being mortgaged for your education loan?" },
  { id: "fn-12", category: "financial", difficulty: "standard", text: "Who else does your sponsor financially support?" },
  { id: "fn-13", category: "financial", difficulty: "standard", text: "What is year-one tuition and how is it being covered?" },
  { id: "fn-14", category: "financial", difficulty: "standard", text: "Did you receive any scholarship, fellowship, or assistantship?" },
  { id: "fn-15", category: "financial", difficulty: "standard", text: "Have you set aside funds for travel, insurance, and initial setup?" },

  // ─── 3. Ties to home country (15) ─────────────────────────────────────
  { id: "th-01", category: "ties", difficulty: "standard", text: "What ties you to your home country?" },
  { id: "th-02", category: "ties", difficulty: "standard", text: "Do you have any property in your home country?" },
  { id: "th-03", category: "ties", difficulty: "standard", text: "Does your family run a business you'd return to?" },
  { id: "th-04", category: "ties", difficulty: "standard", text: "Are your parents and siblings staying in your home country?" },
  { id: "th-05", category: "ties", difficulty: "standard", text: "Do you have a job offer or career anchor waiting after graduation?" },
  { id: "th-06", category: "ties", difficulty: "standard", text: "Have you traveled outside your home country before?" },
  { id: "th-07", category: "ties", difficulty: "standard", text: "Do any close family members live in the US?" },
  { id: "th-08", category: "ties", difficulty: "standard", text: "What career opportunities exist for your degree back home?" },
  { id: "th-09", category: "ties", difficulty: "standard", text: "Why would you return to your home country after graduation?" },
  { id: "th-10", category: "ties", difficulty: "standard", text: "Do you have siblings studying in your home country?" },
  { id: "th-11", category: "ties", difficulty: "standard", text: "Have you ever applied for any US visa before? What happened?" },
  { id: "th-12", category: "ties", difficulty: "standard", text: "Has any of your family applied for or received US immigration benefits?" },
  { id: "th-13", category: "ties", difficulty: "standard", text: "What's your plan for the first six months back home after graduation?" },
  { id: "th-14", category: "ties", difficulty: "standard", text: "Do you know anyone who studied abroad and returned home?" },
  { id: "th-15", category: "ties", difficulty: "standard", text: "What's your single strongest reason for returning home?" },

  // ─── 4. Post-study intentions (10) ────────────────────────────────────
  { id: "ps-01", category: "post_study", difficulty: "standard", text: "What do you plan to do after graduation?" },
  { id: "ps-02", category: "post_study", difficulty: "standard", text: "Are you planning to apply for OPT after graduation?" },
  { id: "ps-03", category: "post_study", difficulty: "standard", text: "What kind of job role are you targeting after your Master's?" },
  { id: "ps-04", category: "post_study", difficulty: "standard", text: "Which industry will you work in after graduation?" },
  { id: "ps-05", category: "post_study", difficulty: "standard", text: "Are you planning a PhD or further study after this program?" },
  { id: "ps-06", category: "post_study", difficulty: "standard", text: "Walk me through your five-year post-graduation plan." },
  { id: "ps-07", category: "post_study", difficulty: "standard", text: "Why return home for that role instead of staying in the US?" },
  { id: "ps-08", category: "post_study", difficulty: "standard", text: "Do you have a specific company in mind to work for in your home country?" },
  { id: "ps-09", category: "post_study", difficulty: "standard", text: "What salary range do you expect on returning home?" },
  { id: "ps-10", category: "post_study", difficulty: "standard", text: "How will your US degree help your career back home?" },

  // ─── 5. General visa intent (10) ──────────────────────────────────────
  { id: "gn-01", category: "general", difficulty: "standard", text: "Have you been to the United States before?" },
  { id: "gn-02", category: "general", difficulty: "standard", text: "Why study in the United States instead of your home country?" },
  { id: "gn-03", category: "general", difficulty: "standard", text: "Why study in the US instead of the UK, Canada, or Australia?" },
  { id: "gn-04", category: "general", difficulty: "standard", text: "Tell me about your high school grades." },
  { id: "gn-05", category: "general", difficulty: "standard", text: "What's your undergraduate GPA?" },
  { id: "gn-06", category: "general", difficulty: "standard", text: "Which standardized tests did you take and what were your scores?" },
  { id: "gn-07", category: "general", difficulty: "standard", text: "Have you ever been denied a visa to any country?" },
  { id: "gn-08", category: "general", difficulty: "standard", text: "Have you ever been refused entry to any country?" },
  { id: "gn-09", category: "general", difficulty: "standard", text: "What's your English proficiency test score?" },
  { id: "gn-10", category: "general", difficulty: "standard", text: "Do you have any relatives in the United States?" },

  // ─── 6. Follow-up / harder variants (10) — strict only ────────────────
  { id: "fu-01", category: "follow_up", difficulty: "strict", text: "You said you'd return home — but what if you got a great US job offer? Be honest." },
  { id: "fu-02", category: "follow_up", difficulty: "strict", text: "Your sponsor's income doesn't comfortably cover four years. What's your plan if their income drops in year two?" },
  { id: "fu-03", category: "follow_up", difficulty: "strict", text: "You mentioned property — what's the current market value and is it in your name?" },
  { id: "fu-04", category: "follow_up", difficulty: "strict", text: "Two students from your university got rejected last week for the exact answer you just gave. What makes yours different?" },
  { id: "fu-05", category: "follow_up", difficulty: "strict", text: "What's your post-graduation backup if the visa is denied today?" },
  { id: "fu-06", category: "follow_up", difficulty: "strict", text: "Walk me through your funding plan for the FULL duration — not just year one." },
  { id: "fu-07", category: "follow_up", difficulty: "strict", text: "Why this school specifically when a cheaper US school would give you the same degree?" },
  { id: "fu-08", category: "follow_up", difficulty: "strict", text: "Your answer was vague. Give me one specific name, number, or date that proves you've prepared." },
  { id: "fu-09", category: "follow_up", difficulty: "strict", text: "If your sponsor passed away tomorrow, who pays for year two?" },
  { id: "fu-10", category: "follow_up", difficulty: "strict", text: "Convince me in one sentence that you'll come back." },
];

/* ─── financial follow-ups injected after each financial Q in strict ─── */
const FINANCIAL_FOLLOWUPS: Question[] = [
  { id: "fn-fu-1", category: "follow_up", difficulty: "strict", text: "Walk me through that funding number again — annually, who pays which part?" },
  { id: "fn-fu-2", category: "follow_up", difficulty: "strict", text: "If your sponsor's income drops 20% next year, what's your backup?" },
  { id: "fn-fu-3", category: "follow_up", difficulty: "strict", text: "Show me in one sentence why that bank balance is enough for year one." },
  { id: "fn-fu-4", category: "follow_up", difficulty: "strict", text: "Where is that money sitting today and how long has it been there?" },
];

/* ────────────────────────────────────────────────────── selector ── */

const FINANCIAL_HEAVY_CONSULATES = ["mumbai", "hyderabad", "chennai"];

/** In-place Fisher-Yates so the input is never aliased across calls. */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type SelectOptions = {
  count: number;
  difficulty: "standard" | "strict";
  consulate?: string | null;
};

/**
 * Pick the questions for one session, applying both the difficulty
 * weighting and the consulate weighting.
 *
 * Returns plain text strings so the caller (MockInterviewClient) can keep
 * its `QUESTIONS[idx]` lookups unchanged.
 */
export function selectQuestions({
  count,
  difficulty,
  consulate,
}: SelectOptions): string[] {
  const financialHeavy =
    !!consulate &&
    FINANCIAL_HEAVY_CONSULATES.some((c) => consulate.toLowerCase().includes(c));

  // Bucket the pool and shuffle each bucket independently so picks vary.
  const buckets: Record<QuestionCategory, Question[]> = {
    study_plan: [],
    financial: [],
    ties: [],
    post_study: [],
    general: [],
    follow_up: [],
  };
  QUESTION_POOL.forEach((q) => buckets[q.category].push(q));
  (Object.keys(buckets) as QuestionCategory[]).forEach((k) => {
    buckets[k] = shuffle(buckets[k]);
  });

  const seen = new Set<string>();
  const picks: Question[] = [];

  const drawFrom = (cat: QuestionCategory): Question | null => {
    while (buckets[cat].length) {
      const q = buckets[cat].shift();
      if (q && !seen.has(q.id)) {
        seen.add(q.id);
        return q;
      }
    }
    return null;
  };

  // Strict pre-pick: at least 2 (up to 3) harder follow-up variants.
  if (difficulty === "strict") {
    const target = Math.min(3, Math.max(2, Math.floor(count * 0.2)));
    for (let i = 0; i < target; i++) {
      const q = drawFrom("follow_up");
      if (q) picks.push(q);
    }
  }

  const remaining = Math.max(0, count - picks.length);
  // Per-mode + per-consulate weight distribution.
  const drawOrder: QuestionCategory[] = [];
  if (financialHeavy) {
    const fin = Math.round(remaining * 0.4);
    const stu = Math.round(remaining * 0.2);
    const ti = Math.round(remaining * 0.2);
    const ps = Math.round(remaining * 0.1);
    const gen = remaining - fin - stu - ti - ps;
    drawOrder.push(
      ...Array<QuestionCategory>(fin).fill("financial"),
      ...Array<QuestionCategory>(stu).fill("study_plan"),
      ...Array<QuestionCategory>(ti).fill("ties"),
      ...Array<QuestionCategory>(ps).fill("post_study"),
      ...Array<QuestionCategory>(Math.max(0, gen)).fill("general"),
    );
  } else {
    const each = Math.floor(remaining / 4);
    const extra = remaining - each * 4;
    drawOrder.push(
      ...Array<QuestionCategory>(each).fill("study_plan"),
      ...Array<QuestionCategory>(each).fill("financial"),
      ...Array<QuestionCategory>(each).fill("ties"),
      ...Array<QuestionCategory>(each).fill("post_study"),
      ...Array<QuestionCategory>(extra).fill("general"),
    );
  }

  for (const cat of shuffle(drawOrder)) {
    const q = drawFrom(cat);
    if (q) picks.push(q);
  }

  // Top up from any remaining bucket if a category ran dry.
  if (picks.length < count) {
    const leftovers = shuffle(
      Object.values(buckets).flat().filter((q) => !seen.has(q.id)),
    );
    for (const q of leftovers) {
      if (picks.length >= count) break;
      seen.add(q.id);
      picks.push(q);
    }
  }

  // Final shuffle of order so categories aren't bunched together.
  const ordered = shuffle(picks);

  // Strict only: inject a financial follow-up directly after each
  // financial question. Total session length may grow by 1–N as a
  // result; that's intentional per the spec.
  if (difficulty === "strict") {
    const followUps = shuffle(FINANCIAL_FOLLOWUPS);
    const expanded: Question[] = [];
    let fuIdx = 0;
    for (const q of ordered) {
      expanded.push(q);
      if (q.category === "financial" && fuIdx < followUps.length) {
        expanded.push(followUps[fuIdx++]);
      }
    }
    return expanded.map((q) => q.text);
  }

  return ordered.map((q) => q.text);
}
