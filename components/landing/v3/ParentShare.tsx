import { Eyebrow } from "./primitives/Eyebrow";
import { PullQuote } from "./primitives/PullQuote";

export function ParentShare() {
  return (
    <section id="parent-share" className="v3-section v3-moment v3-moment-right">
      <div className="v3-moment-copy">
        <Eyebrow>Parent Share</Eyebrow>
        <h2 className="v3-h2 v3-mt-6">
          Your parents see what matters.{" "}
          <span className="v3-italic v3-persimmon">Nothing else.</span>
        </h2>
        <p className="v3-lead v3-mt-6">
          Generate a share link. They open it on any phone — no app, no login.
          They see your phase, your progress, your interview date. They can pay
          for your plan from the same page.
        </p>
        <ul className="v3-bullets v3-mt-6">
          <li><span className="v3-check" aria-hidden />One read-only link, revocable anytime</li>
          <li><span className="v3-check" aria-hidden />Progress, next step, interview date</li>
          <li><span className="v3-check" aria-hidden />Parents can pay from the same page</li>
        </ul>
        <PullQuote attribution="Folake A. · Bachelor's · Lagos" className="v3-mt-10">
          Replaced three nightly phone calls.
        </PullQuote>
      </div>
      <div className="v3-moment-visual">
        <ParentMock />
      </div>
    </section>
  );
}

function ParentMock() {
  return (
    <div className="v3-parent-stage" aria-hidden>
      <div className="v3-phone">
        <div className="v3-phone-notch" />
        <div className="v3-phone-screen">
          <p className="v3-mono v3-phone-eyebrow">Anika — Family view</p>
          <h4 className="v3-phone-h">Your child&rsquo;s F-1 application</h4>
          <div className="v3-phone-progress" aria-hidden><span /></div>
          <p className="v3-mono v3-phone-meta">63% complete · updated 2m ago</p>
          <ul className="v3-phone-chips">
            <li style={{ animationDelay: "200ms" }}>Phase 4 of 5</li>
            <li style={{ animationDelay: "500ms" }}>Mocks done: 2</li>
            <li style={{ animationDelay: "800ms" }}>Docs 12 / 14</li>
          </ul>
          <div className="v3-phone-foot">
            <span className="v3-dot-pulse" />
            <span className="v3-mono">Live updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
