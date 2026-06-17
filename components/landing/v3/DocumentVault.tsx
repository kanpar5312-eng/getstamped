import { Eyebrow } from "./primitives/Eyebrow";
import { PullQuote } from "./primitives/PullQuote";

export function DocumentVault() {
  return (
    <section id="document-vault" className="v3-section v3-moment v3-moment-right">
      <div className="v3-moment-copy">
        <Eyebrow>Document Vault</Eyebrow>
        <h2 className="v3-h2 v3-mt-6">
          Catch the mistake that{" "}
          <span className="v3-italic v3-persimmon">would&rsquo;ve</span> cost
          you a month.
        </h2>
        <p className="v3-lead v3-mt-6">
          Upload your I-20, passport, SEVIS receipt, DS-160, and bank statements.
          Each one is verified by an AI vision model trained on the exact 221(g)
          failure modes consular officers cite. Errors come back in plain
          language.
        </p>
        <ul className="v3-bullets v3-mt-6">
          <li><span className="v3-check" aria-hidden />Page-by-page AI validation against refusal patterns</li>
          <li><span className="v3-check" aria-hidden />Plain-language fixes, not error codes</li>
          <li><span className="v3-check" aria-hidden />One vault, shareable with parents read-only</li>
        </ul>
        <PullQuote attribution="Diego R. · Master's · Bogotá" className="v3-mt-10">
          GetStamped flagged a missing signature the day before my appointment.
        </PullQuote>
      </div>
      <div className="v3-moment-visual">
        <DocsMock />
      </div>
    </section>
  );
}

function DocsMock() {
  return (
    <div className="v3-mock v3-mock-docs" aria-hidden>
      <div className="v3-mock-head">
        <span>Document vault</span>
        <span className="v3-mono">6 of 9 ready</span>
      </div>
      <ul className="v3-doc-rows">
        <li className="v3-doc-done">
          <span className="v3-doc-name">Passport bio page</span>
          <span className="v3-doc-pill v3-doc-pill-ok">Checked</span>
        </li>
        <li className="v3-doc-checking">
          <span className="v3-doc-name">I-20 — signature page</span>
          <span className="v3-doc-pill v3-doc-pill-busy">Checking…</span>
          <span className="v3-doc-scan" aria-hidden />
        </li>
        <li className="v3-doc-flag">
          <span className="v3-doc-name">Bank statement (page 3)</span>
          <span className="v3-doc-pill v3-doc-pill-warn">
            <span className="v3-doc-dot" />Re-upload page 3
          </span>
        </li>
      </ul>
      <div className="v3-progress" aria-hidden><span /></div>
      <p className="v3-mock-foot v3-mono">9 documents · 6 ready · 1 needs you</p>
    </div>
  );
}
