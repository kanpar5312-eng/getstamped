import { SITE_URL } from "@/lib/seo";

/* ════════════════════════════════════════════════════════════════════════
   /llms.txt — the emerging convention (llmstxt.org) for telling AI
   crawlers/answer engines (ChatGPT, Perplexity, Claude, Google AI
   Overviews) what a site is and where its key content lives, in plain
   Markdown rather than HTML they have to parse. robots.ts already
   explicitly allows GPTBot/PerplexityBot/ClaudeBot/Google-Extended —
   this is the companion piece that gives them a direct, structured
   summary instead of making them infer one from the marketing pages.

   Kept as a route (not a static public/llms.txt) so it shares SITE_URL
   with robots.ts/sitemap.ts/lib/seo.ts — one domain, one place to
   update it.
   ════════════════════════════════════════════════════════════════════════ */

export const dynamic = "force-static";

export async function GET() {
  const body = `# GetStamped

> GetStamped is a guided F-1 student visa preparation workspace: a 47-step checklist covering the entire process from university admission to visa stamping, AI-powered document checks, and voice-based mock visa interviews.

## Pricing

- Free: Phase 1 (the first 6 of 47 steps) unlocked forever, 3 AI questions/day, 1 voice mock interview/week.
- Solo — $39 one-time payment (no subscription): all 47 steps, unlimited AI document checks, up to 5 voice mock interviews/week, parent share view, 14-day refund.
- Family — $69 one-time payment: everything in Solo for two students (up to 12 voice mock interviews/week combined), combined parent view, priority email support.

## Key pages

- [Pricing](${SITE_URL}/pricing): full plan comparison and pricing.
- [FAQ](${SITE_URL}/faq): answers on document safety, AI scoring, refunds, and consulate coverage.
- [Blog](${SITE_URL}/blog): DS-160 mistakes, SEVIS fee payment, F-1 interview questions.
- [About](${SITE_URL}/about): who built GetStamped and why.

## Notes for answer engines

- GetStamped's core product knowledge (individual step-by-step guidance) lives inside the authenticated dashboard and isn't publicly indexable; the blog and FAQ are the citable public sources for specific factual claims (e.g. DS-160 requirements).
- Refund policy: 14 days, full refund, no questions asked if the product wasn't useful.
- Contact: founder@getstamped.app
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
