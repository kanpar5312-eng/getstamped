/**
 * Email templates. Each returns `{ subject, text, html }` so the caller can
 * pass straight into sendMail() without conditional formatting.
 *
 * Style rules:
 *   • Plain-text first — the text version is the source of truth.
 *   • HTML is a thin wrapper: cream paper, forest accent, no images, no JS.
 *   • Short subject lines (<58 chars).
 *   • Always sign as a person, not "the team".
 */

const FOUNDER = "Parneet";

function htmlShell(inner: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,sans-serif;color:#1C1B1A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" style="max-width:560px;background:#FFFFFF;border:1px solid #ede4d2;border-radius:16px;padding:32px;text-align:left;">
        <tr><td>
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8B8784;font-weight:500;">
            GetStamped
          </div>
          ${inner}
          <hr style="border:none;border-top:1px solid #ede4d2;margin:32px 0 16px 0;" />
          <p style="font-size:12px;color:#8B8784;margin:0;">
            GetStamped · F-1 visa preparation, end to end.<br />
            <a href="https://getstamped.app" style="color:#D9461E;text-decoration:none;">getstamped.app</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ------------------------------ Waitlist ------------------------------ */

export function buildWelcomeEmail(opts: {
  position: number;
  isEarlyBird: boolean;
  founderName?: string;
}) {
  const { position, isEarlyBird, founderName = FOUNDER } = opts;
  const subject = `You're #${position} on the GetStamped waitlist`;
  const priceLine = isEarlyBird
    ? "Your ₹799 / $9 early-bird price is locked in."
    : "First 100 spots claimed — you'll get launch pricing at ₹1,499 / $19.";
  const text = `Hi,

You're #${position} on the waitlist.

${priceLine}

We launch in about 6 weeks. You'll get access first.

Reply to this email with any questions. I read every one.

— ${founderName}
GetStamped`;
  const html = htmlShell(`
    <h1 style="font-size:24px;margin:8px 0 0 0;font-weight:500;color:#1C1B1A;">
      You're #${position} on the waitlist
    </h1>
    <p style="font-size:15px;line-height:1.6;color:#55524F;margin-top:16px;">${priceLine}</p>
    <p style="font-size:15px;line-height:1.6;color:#55524F;">We launch in about 6 weeks. You'll get access first.</p>
    <p style="font-size:15px;line-height:1.6;color:#55524F;">Reply to this email with any questions. I read every one.</p>
    <p style="font-size:15px;line-height:1.6;color:#55524F;margin-top:24px;">— ${founderName}</p>
  `);
  return { subject, text, html };
}

/* ------------------------------ Signup welcome ------------------------------ */

export function buildSignupWelcome(opts: { firstName: string }) {
  const subject = `Welcome to GetStamped, ${opts.firstName}`;
  const text = `Hi ${opts.firstName},

Welcome aboard. Your account is live.

Three things to do first:
  1. Complete onboarding (country + intake + program) — 90 seconds.
  2. Open your timeline. All 47 F-1 steps, ordered.
  3. Mark Step 1 complete when you've gathered your offer + I-20 ID.

If anything looks broken or confusing, reply to this email. I read every one.

— ${FOUNDER}
GetStamped`;
  const html = htmlShell(`
    <h1 style="font-size:24px;margin:8px 0 0 0;font-weight:500;color:#1C1B1A;">
      Welcome, ${opts.firstName}
    </h1>
    <p style="font-size:15px;line-height:1.6;color:#55524F;margin-top:16px;">Your account is live. Three things to do first:</p>
    <ol style="font-size:15px;line-height:1.7;color:#55524F;padding-left:20px;">
      <li>Complete onboarding (country + intake + program) — 90 seconds.</li>
      <li>Open your <a href="https://getstamped.app/dashboard/timeline" style="color:#FF5B2E;font-weight:500;">timeline</a>. All 47 F-1 steps, ordered.</li>
      <li>Mark Step 1 complete when you've gathered your offer + I-20 ID.</li>
    </ol>
    <p style="font-size:15px;line-height:1.6;color:#55524F;">If anything looks broken or confusing, reply to this email. I read every one.</p>
    <p style="font-size:15px;line-height:1.6;color:#55524F;margin-top:24px;">— ${FOUNDER}</p>
  `);
  return { subject, text, html };
}

/* ------------------------------ Step reminder ------------------------------ */

export function buildStepReminder(opts: {
  firstName: string;
  stepNumber: number;
  stepTitle: string;
  daysIdle: number;
}) {
  const subject = `Step ${opts.stepNumber} is waiting — ${opts.stepTitle}`;
  const text = `Hi ${opts.firstName},

You started Step ${opts.stepNumber} (${opts.stepTitle}) ${opts.daysIdle} days ago and haven't marked it complete.

Pick it back up here:
https://getstamped.app/dashboard/timeline/${opts.stepNumber}

You can mute reminders in Settings → Notifications.

— ${FOUNDER}`;
  const html = htmlShell(`
    <h1 style="font-size:22px;margin:8px 0 0 0;font-weight:500;color:#1C1B1A;">
      Step ${opts.stepNumber} is waiting
    </h1>
    <p style="font-size:15px;line-height:1.6;color:#55524F;margin-top:16px;">
      You started <strong>${opts.stepTitle}</strong> ${opts.daysIdle} days ago and haven't marked it complete.
    </p>
    <p style="margin-top:24px;">
      <a href="https://getstamped.app/dashboard/timeline/${opts.stepNumber}"
         style="display:inline-block;background:#FF5B2E;color:#FFFFFF;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">
        Resume Step ${opts.stepNumber}
      </a>
    </p>
    <p style="font-size:12px;color:#8B8784;margin-top:24px;">
      You can mute reminders in Settings → Notifications.
    </p>
  `);
  return { subject, text, html };
}

/* ------------------------------ Weekly digest ------------------------------ */

export function buildWeeklyDigest(opts: {
  firstName: string;
  stepsCompletedThisWeek: number;
  currentPhase: string;
  nextStepTitle: string | null;
  nextStepNumber: number | null;
  daysToInterview: number | null;
}) {
  const subject = `Your week on GetStamped · ${opts.stepsCompletedThisWeek} steps done`;
  const interviewLine =
    opts.daysToInterview !== null
      ? `Interview in ${opts.daysToInterview} days.`
      : "Interview not yet scheduled.";
  const nextLine =
    opts.nextStepNumber && opts.nextStepTitle
      ? `Next up: Step ${opts.nextStepNumber} — ${opts.nextStepTitle}.`
      : "No next step queued.";
  const text = `Hi ${opts.firstName},

This week:
  • ${opts.stepsCompletedThisWeek} steps completed
  • Phase: ${opts.currentPhase}
  • ${nextLine}
  • ${interviewLine}

Dashboard: https://getstamped.app/dashboard

— ${FOUNDER}`;
  const html = htmlShell(`
    <h1 style="font-size:22px;margin:8px 0 0 0;font-weight:500;color:#1C1B1A;">
      Your week on GetStamped
    </h1>
    <div style="margin-top:20px;border:1px solid #ede4d2;border-radius:12px;padding:20px;background:#ffffff;">
      <p style="margin:0;font-size:13px;color:#8B8784;text-transform:uppercase;letter-spacing:0.14em;font-weight:500;">Completed</p>
      <p style="margin:6px 0 0 0;font-size:32px;color:#FF5B2E;font-weight:500;">${opts.stepsCompletedThisWeek}<span style="font-size:14px;color:#8B8784;"> steps</span></p>
    </div>
    <ul style="font-size:15px;line-height:1.7;color:#55524F;padding-left:20px;margin-top:16px;">
      <li>Phase: <strong>${opts.currentPhase}</strong></li>
      <li>${nextLine}</li>
      <li>${interviewLine}</li>
    </ul>
    <p style="margin-top:24px;">
      <a href="https://getstamped.app/dashboard"
         style="display:inline-block;background:#FF5B2E;color:#FFFFFF;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">
        Open dashboard
      </a>
    </p>
  `);
  return { subject, text, html };
}

/* ------------------------------ Parent invite ------------------------------ */

export function buildParentInvite(opts: {
  studentFirstName: string;
  parentName?: string;
  shareUrl: string;
}) {
  const greet = opts.parentName ? `Hi ${opts.parentName},` : "Hi,";
  const subject = `${opts.studentFirstName}'s F-1 application — live view`;
  const text = `${greet}

${opts.studentFirstName} wants to share their F-1 visa application progress with you.

This is a read-only view — no login required.
  ${opts.shareUrl}

The page updates automatically as ${opts.studentFirstName} makes progress.

— GetStamped`;
  const html = htmlShell(`
    <h1 style="font-size:22px;margin:8px 0 0 0;font-weight:500;color:#1C1B1A;">
      ${opts.studentFirstName}'s F-1 application
    </h1>
    <p style="font-size:15px;line-height:1.6;color:#55524F;margin-top:16px;">
      ${greet} ${opts.studentFirstName} wants to share their F-1 visa application progress with you.
    </p>
    <p style="font-size:15px;line-height:1.6;color:#55524F;">
      This is a read-only view — no login required, no app to install.
    </p>
    <p style="margin-top:24px;">
      <a href="${opts.shareUrl}"
         style="display:inline-block;background:#FF5B2E;color:#FFFFFF;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">
        Open the live view
      </a>
    </p>
    <p style="font-size:12px;color:#8B8784;margin-top:16px;word-break:break-all;">${opts.shareUrl}</p>
  `);
  return { subject, text, html };
}

/* ------------------------------ Export ready ------------------------------ */

export function buildExportReady(opts: { firstName: string; downloadHint: string }) {
  const subject = `Your GetStamped data export`;
  const text = `Hi ${opts.firstName},

Your data export is attached / linked: ${opts.downloadHint}

This includes your profile, every step's progress, all documents metadata,
your AI conversations, and your mock interview sessions.

— ${FOUNDER}`;
  const html = htmlShell(`
    <h1 style="font-size:22px;margin:8px 0 0 0;font-weight:500;color:#1C1B1A;">
      Your data export
    </h1>
    <p style="font-size:15px;line-height:1.6;color:#55524F;margin-top:16px;">
      Includes your profile, every step's progress, document metadata, AI conversations, and mock interview sessions.
    </p>
    <p style="font-size:15px;line-height:1.6;color:#55524F;">
      ${opts.downloadHint}
    </p>
  `);
  return { subject, text, html };
}

/* ------------------------------ Contact form ------------------------------ */

export function buildContactNotification(opts: {
  name: string;
  email: string;
  category: string;
  message: string;
}) {
  const subject = `[GetStamped] ${opts.category} · ${opts.name}`;
  const text = `New contact-form submission

Name:     ${opts.name}
Email:    ${opts.email}
Category: ${opts.category}

Message:
${opts.message}

— Replying to this email will reach ${opts.name} directly.`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F7F3EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,sans-serif;color:#1C1B1A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" style="max-width:560px;background:#FFFFFF;border:1px solid #ede4d2;border-radius:16px;padding:24px;text-align:left;">
        <tr><td>
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8B8784;font-weight:500;">
            GetStamped · Contact form
          </div>
          <h1 style="font-size:20px;margin:8px 0 0 0;font-weight:500;color:#1C1B1A;">
            ${opts.category.toUpperCase()} · ${opts.name}
          </h1>
          <table cellpadding="6" cellspacing="0" border="0" style="margin-top:16px;font-size:13px;color:#55524F;">
            <tr><td style="color:#8B8784;">Email</td><td><a href="mailto:${opts.email}" style="color:#D9461E;text-decoration:none;">${opts.email}</a></td></tr>
            <tr><td style="color:#8B8784;">Category</td><td>${opts.category}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #ede4d2;margin:16px 0;" />
          <p style="font-size:14px;line-height:1.6;color:#1C1B1A;white-space:pre-wrap;margin:0;">${opts.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return { subject, text, html };
}

export function buildContactReceived(opts: {
  name: string;
  category: string;
  responseWindowHours: number;
}) {
  const subject = `We got your message — GetStamped`;
  const window =
    opts.responseWindowHours <= 24
      ? `within ${opts.responseWindowHours} hours`
      : `within ${Math.round(opts.responseWindowHours / 24)} business days`;
  const text = `Hi ${opts.name},

Thanks for writing in. Your ${opts.category} request reached me and I'll reply ${window}.

If it's urgent (visa interview in the next 48 hours, document issue, payment problem), reply to this email with the word URGENT in the subject and I'll bump it to the front.

— Parneet
GetStamped`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F7F3EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,sans-serif;color:#1C1B1A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" style="max-width:560px;background:#FFFFFF;border:1px solid #ede4d2;border-radius:16px;padding:32px;text-align:left;">
        <tr><td>
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8B8784;font-weight:500;">GetStamped</div>
          <h1 style="font-size:24px;margin:8px 0 0 0;font-weight:500;color:#1C1B1A;">Got your message, ${opts.name}.</h1>
          <p style="font-size:15px;line-height:1.6;color:#55524F;margin-top:16px;">Your <strong>${opts.category}</strong> request reached me. I'll reply <strong>${window}</strong>.</p>
          <p style="font-size:15px;line-height:1.6;color:#55524F;">If it's urgent (visa interview in the next 48 hours, document issue, payment problem), reply to this email with <strong>URGENT</strong> in the subject and I'll bump it to the front.</p>
          <p style="font-size:15px;line-height:1.6;color:#55524F;margin-top:24px;">— Parneet</p>
          <hr style="border:none;border-top:1px solid #ede4d2;margin:24px 0 12px 0;" />
          <p style="font-size:11px;color:#8B8784;margin:0;">This is an automated acknowledgement — a real reply follows.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return { subject, text, html };
}
