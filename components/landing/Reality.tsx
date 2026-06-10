import { Eyebrow } from "@/components/ui/Eyebrow";

type Pain = { n: string; body: string };

const PAINS: Pain[] = [
  {
    n: "01",
    body:
      "The DS-160 form has 91 fields. A single typo on your SEVIS number means starting the application over. Students lose weeks to mistakes that should have been caught before submission.",
  },
  {
    n: "02",
    body:
      "Administrative processing — known as a 221(g) — adds an average of six weeks to your timeline. The most common cause isn’t a complex case. It’s missing or mismatched paperwork that could have been organized in advance.",
  },
  {
    n: "03",
    body:
      "Education consultants charge between $300 and $1,200 to do what amounts to managing a checklist. The information they sell is publicly available — they’re profiting from the chaos, not solving it.",
  },
];

type Quote = { text: string; attribution: string };

// Quotes are paraphrased from public F-1 visa forums and anonymized.
// They are NOT verbatim — names, identifying details, and exact wording have
// been changed. Each is composited from multiple posts describing the same
// pattern so no individual is identifiable.
const QUOTES: Quote[] = [
  {
    text:
      "Had everything ready except I forgot to print the DS-160 confirmation page. Officer told me to come back next month. Lost my Fall intake.",
    attribution: "Composite from F-1 prep forums",
  },
  {
    text:
      "Paid a consultant a lot of money and got a PDF I could have downloaded for free from the embassy site. Felt like I paid for someone to Google for me.",
    attribution: "Composite from F-1 prep forums",
  },
  {
    text:
      "The interview itself was three minutes. The six months of confusion before it was the actual problem nobody talks about.",
    attribution: "Composite from F-1 prep forums",
  },
];

export function Reality() {
  return (
    <section
      aria-labelledby="reality-heading"
      className="w-full bg-[var(--color-cream)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="pb-10">
          <Eyebrow>The reality</Eyebrow>
          <h2
            id="reality-heading"
            className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-snug text-[var(--color-ink)] max-w-3xl"
          >
            Here&rsquo;s what the F-1 process actually looks like.
          </h2>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-14">
          {/* LEFT — pain paragraphs */}
          <div className="flex flex-col gap-12">
            {PAINS.map((p) => (
              <div key={p.n}>
                <div className="font-mono text-xs text-[var(--color-forest)] tracking-[0.05em]">
                  {p.n}
                </div>
                <p className="mt-3 text-base sm:text-[17px] leading-relaxed text-[var(--color-ink)] max-w-[520px]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          {/* RIGHT — anonymized composite quotes (paraphrased, not verbatim) */}
          <div className="lg:pl-4">
            {QUOTES.map((q, i) => (
              <figure
                key={i}
                className={[
                  "py-8",
                  i > 0 ? "border-t border-[var(--color-border-soft)]" : "",
                ].join(" ")}
              >
                <blockquote className="text-base leading-relaxed text-[var(--color-ink-soft)] max-w-[520px] italic">
                  &ldquo;{q.text}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-xs text-[var(--color-muted)]">
                  — {q.attribution}
                </figcaption>
              </figure>
            ))}
            <p className="pt-4 text-[10px] text-[var(--color-muted)] leading-relaxed max-w-[520px]">
              Quotes are paraphrased composites from public F-1 prep forums. No
              real names or identifying details. We&rsquo;ll replace these with
              attributed customer testimonials after launch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
