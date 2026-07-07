"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useEffect } from "react";
import { updateProfile, type ProfileUpdate } from "@/app/actions/profile";
import { updatePriorRefusal } from "@/app/actions/prior-refusal";
import {
  exportUserData,
  requestEmailChange,
  requestRefund,
  resetProgress,
  scheduleAccountDeletion,
  updateNotifPrefs,
  updatePassword,
} from "@/app/actions/account";
import {
  inviteFamilyMember,
  revokeFamilyInvite,
  removeFamilyMember,
  leaveFamilyGroup,
} from "@/app/actions/family";

type Plan = "free" | "solo" | "family";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  university: string;
  intakeTerm: string;
  intakeDate: string;
  interviewDate: string;
  consulate: string;
  programType: string;
  fundingSource: string;
  plan: Plan;
};

type Notif = "deadlines" | "weekly" | "stepUpdates" | "marketing";

type ReferralProps = {
  code: string | null;
  link: string | null;
  totalReferred: number;
  totalCompleted: number;
  creditInrPaise: number;
  creditUsdCents: number;
};

export type FamilyMemberView = { userId: string; firstName: string | null; isOwner: boolean; isYou: boolean };
export type FamilyPendingInvite = { id: string; email: string };
export type FamilySummary = {
  role: "owner" | "member" | "none";
  maxSeats: number;
  seats: FamilyMemberView[];
  pendingInvites: FamilyPendingInvite[];
};

type Props = {
  initial: Profile;
  referral?: ReferralProps;
  family?: FamilySummary;
  // Optional: absent or defaulted when migration 0013_prior_refusal.sql
  // hasn't been applied yet — see lib/prior-refusal.ts.
  priorRefusalInitial?: { priorRefusal: boolean; reason: string | null };
};

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "application", label: "Application" },
  { id: "plan", label: "Plan" },
  { id: "refer", label: "Refer a friend" },
  { id: "notifications", label: "Notifications" },
  { id: "account", label: "Account" },
  { id: "danger", label: "Danger zone" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const CONSULATES = ["Mumbai", "New Delhi", "Chennai", "Hyderabad", "Kolkata", "Beijing", "Shanghai", "Hanoi", "Seoul", "Tokyo", "Lagos", "Cairo", "Istanbul", "Dubai", "London", "Mexico City", "São Paulo"];
const COUNTRIES = ["India", "China", "Vietnam", "Nigeria", "Brazil", "South Korea", "Bangladesh", "Mexico", "Iran", "Saudi Arabia", "Other"];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-medium text-[var(--color-ink-soft)]">{label}</span>
      <div className="mt-1.5 min-w-0">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-[var(--color-muted)]">{hint}</p>}
    </label>
  );
}

const input = "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors";

// iOS Safari gives <input type="date"> an intrinsic min-width and ignores
// w-full, so the field overflows its grid cell. appearance-none + min-w-0 +
// box-border force it to shrink to the container like every other input.
const dateInput = `${input} appearance-none min-w-0 max-w-full box-border`;

const isSectionId = (v: string): v is SectionId => SECTIONS.some((s) => s.id === v);

export function SettingsClient({ initial, referral, family, priorRefusalInitial }: Props) {
  const router = useRouter();

  // Isolated from `data`/`baseline`/`save` on purpose — this field writes
  // through its own server action (app/actions/prior-refusal.ts) against
  // its own migration, so it can't affect the existing Application save.
  const [prFlag, setPrFlag] = useState(priorRefusalInitial?.priorRefusal ?? false);
  const [prReason, setPrReason] = useState(priorRefusalInitial?.reason ?? "");
  const [prBaseline, setPrBaseline] = useState({
    flag: priorRefusalInitial?.priorRefusal ?? false,
    reason: priorRefusalInitial?.reason ?? "",
  });
  const [prSaving, setPrSaving] = useState(false);
  const [prSaved, setPrSaved] = useState(false);
  const prDirty = prFlag !== prBaseline.flag || prReason !== prBaseline.reason;

  const savePriorRefusal = () => {
    setPrSaving(true);
    startTransition(async () => {
      const result = await updatePriorRefusal({ priorRefusal: prFlag, reason: prReason.trim() || null });
      setPrSaving(false);
      if (result.ok) {
        setPrBaseline({ flag: prFlag, reason: prReason });
        setPrSaved(true);
        setTimeout(() => setPrSaved(false), 2000);
      } else {
        showToast(result.error);
      }
    });
  };
  const [active, setActive] = useState<SectionId>("profile");

  // Deep links like /dashboard/settings#plan (used by the upgrade page's
  // "Invite your second student" link and the referral-reward email)
  // land on the right tab instead of always defaulting to Profile.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (isSectionId(hash)) setActive(hash);
  }, []);
  const [data, setData] = useState<Profile>(initial);
  const [baseline, setBaseline] = useState<Profile>(initial);
  const [saved, setSaved] = useState<SectionId | null>(null);
  const [savingSection, setSavingSection] = useState<SectionId | null>(null);
  const [, startTransition] = useTransition();
  const [notifs, setNotifs] = useState<Record<Notif, boolean>>({ deadlines: true, weekly: true, stepUpdates: true, marketing: false });
  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [refundModal, setRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  /* ─── two-factor auth (TOTP) ─── */
  const [twoFAModal, setTwoFAModal] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAEnrollment, setTwoFAEnrollment] = useState<{
    factorId: string;
    qr: string;
    secret: string;
  } | null>(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFAVerifiedFactorId, setTwoFAVerifiedFactorId] = useState<string | null>(null);
  const [twoFABusy, setTwoFABusy] = useState(false);

  // On mount: poll current 2FA state so the row label can render correctly.
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    void sb.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.find((f) => f.status === "verified") ?? null;
      setTwoFAEnabled(Boolean(verified));
      setTwoFAVerifiedFactorId(verified?.id ?? null);
    });
  }, []);

  const refreshTwoFAState = async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = await sb.auth.mfa.listFactors();
    const verified = data?.totp?.find((f) => f.status === "verified") ?? null;
    setTwoFAEnabled(Boolean(verified));
    setTwoFAVerifiedFactorId(verified?.id ?? null);
  };

  const openTwoFAModal = async () => {
    setTwoFAError(null);
    setTwoFACode("");
    setTwoFAEnrollment(null);
    setTwoFAModal(true);
    await refreshTwoFAState();
  };

  const startEnroll = async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setTwoFAError(null);
    setTwoFABusy(true);
    // Clean up any stale unverified factor so enroll doesn't fail.
    const { data: existing } = await sb.auth.mfa.listFactors();
    const stale = existing?.totp?.find((f) => f.status !== "verified");
    if (stale) {
      await sb.auth.mfa.unenroll({ factorId: stale.id });
    }
    const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp" });
    setTwoFABusy(false);
    if (error || !data) {
      setTwoFAError(error?.message ?? "Couldn't start enrollment. Try again.");
      return;
    }
    setTwoFAEnrollment({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    });
  };

  const verifyEnroll = async () => {
    const sb = getBrowserSupabase();
    if (!sb || !twoFAEnrollment) return;
    setTwoFAError(null);
    setTwoFABusy(true);
    const { data: challenge, error: chErr } = await sb.auth.mfa.challenge({
      factorId: twoFAEnrollment.factorId,
    });
    if (chErr || !challenge) {
      setTwoFABusy(false);
      setTwoFAError(chErr?.message ?? "Couldn't verify the code. Try again.");
      return;
    }
    const { error: vErr } = await sb.auth.mfa.verify({
      factorId: twoFAEnrollment.factorId,
      challengeId: challenge.id,
      code: twoFACode.trim(),
    });
    setTwoFABusy(false);
    if (vErr) {
      setTwoFAError(vErr.message);
      return;
    }
    setTwoFAEnrollment(null);
    setTwoFACode("");
    await refreshTwoFAState();
    showToast("Two-factor authentication is on.");
    setTwoFAModal(false);
  };

  const removeTwoFA = async () => {
    const sb = getBrowserSupabase();
    if (!sb || !twoFAVerifiedFactorId) return;
    setTwoFAError(null);
    setTwoFABusy(true);
    const { error } = await sb.auth.mfa.unenroll({ factorId: twoFAVerifiedFactorId });
    setTwoFABusy(false);
    if (error) {
      setTwoFAError(error.message);
      return;
    }
    await refreshTwoFAState();
    showToast("Two-factor authentication removed.");
    setTwoFAModal(false);
  };

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const dirty = JSON.stringify(data) !== JSON.stringify(baseline);

  const buildPatch = (section: SectionId): ProfileUpdate => {
    if (section === "profile") {
      return {
        first_name: data.firstName,
        last_name: data.lastName,
        country: data.country,
      };
    }
    if (section === "application") {
      return {
        university: data.university,
        intake_term: data.intakeTerm,
        intake_date: data.intakeDate || null,
        interview_date: data.interviewDate ? new Date(data.interviewDate).toISOString() : null,
        consulate: data.consulate,
        program_type: data.programType,
        funding_source: data.fundingSource,
      };
    }
    return {};
  };

  const save = (section: SectionId) => {
    setSavingSection(section);
    startTransition(async () => {
      const result = await updateProfile(buildPatch(section));
      setSavingSection(null);
      if (result.ok) {
        setBaseline(data);
        setSaved(section);
        setTimeout(() => setSaved(null), 2000);
        router.refresh();
      } else {
        setToast(result.error);
        setTimeout(() => setToast(null), 3500);
      }
    });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEmailChange = async () => {
    if (pending) return;
    setPending(true);
    const res = await requestEmailChange(newEmail);
    setPending(false);
    if (res.ok) {
      setEmailModal(false);
      setNewEmail("");
      showToast("Verification email sent. Click the link in your inbox to confirm.");
    } else {
      showToast(res.error);
    }
  };

  const handlePasswordChange = async () => {
    if (pending) return;
    if (newPassword !== confirmPassword) {
      showToast("Passwords don't match.");
      return;
    }
    setPending(true);
    const res = await updatePassword(newPassword);
    setPending(false);
    if (res.ok) {
      setPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated.");
    } else {
      showToast(res.error);
    }
  };

  const handleReset = async () => {
    if (pending) return;
    setPending(true);
    const res = await resetProgress();
    setPending(false);
    if (res.ok) {
      setResetModal(false);
      setResetConfirm("");
      showToast("Progress reset.");
      router.refresh();
    } else {
      showToast(res.error);
    }
  };

  const handleDelete = async () => {
    if (pending) return;
    if (deleteConfirmEmail.trim().toLowerCase() !== data.email.trim().toLowerCase()) {
      showToast("Email doesn't match. Type it exactly to confirm.");
      return;
    }
    setPending(true);
    const res = await scheduleAccountDeletion();
    setPending(false);
    if (res.ok) {
      setDeleteModal(false);
      showToast("Deletion scheduled. Sign in within 30 days to reactivate.");
      setTimeout(() => router.push("/"), 1500);
    } else {
      showToast(res.error);
    }
  };

  const handleExport = async () => {
    if (pending) return;
    setPending(true);
    try {
      const res = await exportUserData();
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      // Decode the base64 PDF the server built and trigger a browser
      // download. atob() works in every modern browser without polyfills.
      const binary = atob(res.jsonBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: res.mimeType ?? "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Export downloaded.");
    } catch {
      // Belt-and-suspenders: exportUserData() now catches its own errors
      // and always resolves with { ok: false }, but this button used to
      // silently do nothing on any uncaught server error, so this stays
      // as a last line of defense against the same failure mode.
      showToast("Export failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const handleRefund = async () => {
    if (pending) return;
    setPending(true);
    const res = await requestRefund({ reason: refundReason });
    setPending(false);
    if (res.ok) {
      setRefundModal(false);
      setRefundReason("");
      showToast("Refund request received. We'll reply within 24 hours.");
    } else {
      showToast(res.error);
    }
  };

  const toggleNotif = async (key: Notif) => {
    const next = !notifs[key];
    setNotifs((n) => ({ ...n, [key]: next }));
    const patch: Record<string, boolean> = {};
    if (key === "weekly") patch.weekly_digest = next;
    if (key === "deadlines") patch.reminders = next;
    if (key === "stepUpdates") patch.step_updates = next;
    if (key === "marketing") patch.product_updates = next;
    const res = await updateNotifPrefs(patch);
    if (!res.ok) {
      setNotifs((n) => ({ ...n, [key]: !next }));
      showToast(res.error);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
        <span aria-hidden>→</span>
        <span className="text-[var(--color-ink-soft)]">Settings</span>
      </nav>

      <header className="mt-6 animate-hero-rise">
        <Eyebrow>Settings</Eyebrow>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-[var(--color-ink)] leading-tight">
          Your account, your data.
        </h1>
      </header>

      {/* Mobile section chips */}
      <nav className="lg:hidden mt-6 -mx-5 px-5 overflow-x-auto" aria-label="Settings sections (mobile)">
        <ul className="flex gap-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActive(s.id)}
                className={[
                  "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active === s.id
                    ? "bg-[var(--color-persimmon)] text-[var(--color-paper-soft)]"
                    : "bg-[var(--color-paper-soft)] border border-[var(--color-border-soft)] text-[var(--color-ink-soft)]",
                ].join(" ")}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 flex gap-10">
        {/* Desktop side nav */}
        <aside className="hidden lg:block w-[200px] shrink-0 sticky top-24 self-start">
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActive(s.id)}
                  className={[
                    "w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                    active === s.id
                      ? "bg-[var(--color-paper-deep)] text-[var(--color-ink)] font-medium"
                      : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-deep)]/40 hover:text-[var(--color-ink)]",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 min-w-0">
          {active === "profile" && (
            <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-6 sm:p-7">
              <h2 className="text-base font-medium text-[var(--color-ink)]">Profile</h2>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">Your name, email, and country.</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First name">
                  <input className={input} value={data.firstName} onChange={(e) => set("firstName", e.target.value)} />
                </Field>
                <Field label="Last name">
                  <input className={input} value={data.lastName} onChange={(e) => set("lastName", e.target.value)} />
                </Field>
                <Field label="Email" hint="Read-only — change via verification flow.">
                  <div className="flex gap-2">
                    <input className={`${input} flex-1`} value={data.email} readOnly />
                    <button type="button" onClick={() => setEmailModal(true)} className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 text-xs font-medium text-[var(--color-accent-deep)] hover:border-[var(--color-accent)] transition-colors">
                      Change
                    </button>
                  </div>
                </Field>
                <Field label="Country">
                  <select className={input} value={data.country} onChange={(e) => set("country", e.target.value)}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <SaveRow show={dirty} section="profile" saving={savingSection === "profile"} saved={saved === "profile"} onSave={() => save("profile")} />
            </section>
          )}

          {active === "application" && (
            <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-6 sm:p-7">
              <h2 className="text-base font-medium text-[var(--color-ink)]">Application</h2>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">University, intake, consulate.</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="University">
                  <input className={input} value={data.university} onChange={(e) => set("university", e.target.value)} placeholder="e.g. North Carolina State University" />
                </Field>
                <Field label="Program type">
                  <select className={input} value={data.programType} onChange={(e) => set("programType", e.target.value)}>
                    <option value="Undergrad">Undergrad</option>
                    <option value="Master's">Master&rsquo;s</option>
                    <option value="PhD">PhD</option>
                  </select>
                </Field>
                <Field label="Intake term">
                  <select className={input} value={data.intakeTerm} onChange={(e) => set("intakeTerm", e.target.value)}>
                    <option value="Fall 2026">Fall 2026</option>
                    <option value="Spring 2027">Spring 2027</option>
                    <option value="Fall 2027">Fall 2027</option>
                  </select>
                </Field>
                <Field label="Intake date">
                  <input type="date" className={dateInput} value={data.intakeDate} onChange={(e) => set("intakeDate", e.target.value)} />
                </Field>
                <Field label="Interview date">
                  <input type="date" className={dateInput} value={data.interviewDate} onChange={(e) => set("interviewDate", e.target.value)} />
                </Field>
                <Field label="Consulate location">
                  <select className={input} value={data.consulate} onChange={(e) => set("consulate", e.target.value)}>
                    {CONSULATES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Funding source">
                  <select className={input} value={data.fundingSource} onChange={(e) => set("fundingSource", e.target.value)}>
                    {["Self", "Parents", "Loan", "Scholarship", "Mix"].map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
              <SaveRow show={dirty} section="application" saving={savingSection === "application"} saved={saved === "application"} onSave={() => save("application")} />

              {/* Separate card + separate save action on purpose — see the
                  isolation note on app/actions/prior-refusal.ts. */}
              <div className="mt-6 pt-6 border-t border-[var(--color-border-soft)]">
                <h3 className="text-sm font-medium text-[var(--color-ink)]">Prior visa refusal</h3>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  Optional. If you&rsquo;ve been refused a US visa before, flagging it here lets the mock interview weight what&rsquo;s different about this attempt.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Have you been refused before?">
                    <select
                      className={input}
                      value={prFlag ? "yes" : "no"}
                      onChange={(e) => setPrFlag(e.target.value === "yes")}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </Field>
                  {prFlag && (
                    <Field label="What changed since then?" hint="Optional — helps tailor mock interview feedback.">
                      <input
                        className={input}
                        value={prReason}
                        onChange={(e) => setPrReason(e.target.value)}
                        placeholder="e.g. new sponsor letter, job offer, stronger ties evidence"
                      />
                    </Field>
                  )}
                </div>
                <SaveRow show={prDirty} section="prior-refusal" saving={prSaving} saved={prSaved} onSave={savePriorRefusal} />
              </div>
            </section>
          )}

          {active === "plan" && (
            <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-6 sm:p-7">
              <h2 className="text-base font-medium text-[var(--color-ink)]">Plan</h2>
              <div className="mt-6 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-paper)] p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <Eyebrow>Current plan</Eyebrow>
                    <h3 className="mt-1 font-display text-2xl tracking-tight text-[var(--color-ink)] capitalize">{data.plan}</h3>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {data.plan === "free" ? "Phase 1 free forever." : "Lifetime access until your visa is stamped."}
                    </p>
                  </div>
                  {data.plan === "free" ? (
                    <Link href="/dashboard/upgrade">
                      <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors">
                        Upgrade →
                      </button>
                    </Link>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors">
                        Manage billing
                      </button>
                      <button
                        type="button"
                        onClick={() => setRefundModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] hover:border-red-300 hover:text-red-700 transition-colors"
                      >
                        Request refund
                      </button>
                    </div>
                  )}
                </div>
                {data.plan !== "free" && (
                  <p className="mt-4 pt-4 border-t border-[var(--color-border-soft)] text-[11px] text-[var(--color-muted)] leading-relaxed">
                    14-day refund window from purchase, no questions asked.
                    See the{" "}
                    <Link href="/refund" className="text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors">
                      refund policy
                    </Link>{" "}
                    for details.
                  </p>
                )}
                {data.plan === "family" && (
                  <div className="mt-6 border-t border-[var(--color-border-soft)] pt-5">
                    <FamilyMembersSection family={family} />
                  </div>
                )}
              </div>
            </section>
          )}

          {active === "refer" && (
            <ReferSection referral={referral} />
          )}

          {active === "notifications" && (
            <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-6 sm:p-7">
              <h2 className="text-base font-medium text-[var(--color-ink)]">Notifications</h2>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">Choose what we email you about.</p>
              <ul className="mt-6 space-y-4">
                {[
                  { key: "deadlines" as const, label: "Deadline reminders", desc: "Email when a step or document is due soon." },
                  { key: "weekly" as const, label: "Weekly progress summary", desc: "Every Sunday, a short recap of the week." },
                  { key: "stepUpdates" as const, label: "Step content updates", desc: "When we refresh a step you've completed." },
                  { key: "marketing" as const, label: "Product news", desc: "Occasional updates about new features." },
                ].map((row) => (
                  <li key={row.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">{row.label}</p>
                      <p className="text-xs text-[var(--color-muted)]">{row.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifs[row.key]}
                      onClick={() => toggleNotif(row.key)}
                      className={[
                        "relative inline-block h-5 w-9 rounded-full transition-colors shrink-0",
                        notifs[row.key] ? "bg-[var(--color-persimmon)]" : "bg-[var(--color-paper-deep)]",
                      ].join(" ")}
                    >
                      <span className={[
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
                        notifs[row.key] ? "left-[1.125rem]" : "left-0.5",
                      ].join(" ")} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {active === "account" && (
            <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-6 sm:p-7">
              <h2 className="text-base font-medium text-[var(--color-ink)]">Account</h2>
              <ul className="mt-6 divide-y divide-[var(--color-border-soft)]">
                {[
                  { label: "Change email", action: () => setEmailModal(true) },
                  { label: "Change password", action: () => setPasswordModal(true) },
                  {
                    label: twoFAEnabled
                      ? "Two-factor authentication · ON"
                      : "Two-factor authentication",
                    action: openTwoFAModal,
                  },
                  { label: "Connected accounts (Google)", action: () => showToast("Google sign-in available at launch.") },
                ].map((row, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-3.5">
                    <span className="text-sm text-[var(--color-ink)]">{row.label}</span>
                    <button type="button" onClick={row.action} className="text-xs text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors">
                      Open →
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {active === "danger" && (
            /* Was border-red-200 / bg-red-50/40 — Tailwind's red-50/200 are
               pale, light-mode-only colors. Blended at 40% over this
               dark dashboard surface they read as a muddy gray-pink wash
               instead of a warning. var(--error) already flips correctly
               between the dashboard's light/dark palettes. */
            <section className="rounded-2xl border-2 border-[var(--error)]/35 bg-[var(--error)]/[0.07] p-6 sm:p-7">
              <h2 className="text-base font-medium text-[var(--error)]">Danger zone</h2>
              <p className="mt-0.5 text-xs text-[var(--error)]/70">Actions here are permanent.</p>
              <ul className="mt-6 space-y-3">
                {[
                  { label: "Reset all progress", desc: "Clears completed steps. Documents stay.", action: () => setResetModal(true) },
                  { label: "Export my data", desc: "GDPR · download a readable PDF of everything.", action: handleExport },
                  { label: "Delete account", desc: "30-day grace period. Reactivate by signing in within 30 days.", action: () => setDeleteModal(true) },
                ].map((row, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--error)]/25 bg-[var(--color-paper-soft)] p-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">{row.label}</p>
                      <p className="text-xs text-[var(--color-muted)]">{row.desc}</p>
                    </div>
                    <button type="button" onClick={row.action} className="text-xs font-medium text-[var(--error)] hover:opacity-80 transition-opacity shrink-0">
                      Continue
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>

      {/* Modals */}
      <Modal
        open={emailModal}
        onClose={() => setEmailModal(false)}
        eyebrow="Change email"
        title="Verify your new email"
        footer={
          <>
            <button type="button" onClick={() => setEmailModal(false)} className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-colors">Cancel</button>
            <button type="button" disabled={pending || !newEmail} onClick={handleEmailChange} className="rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50">{pending ? "Sending…" : "Send verification"}</button>
          </>
        }
      >
        <Field label="New email">
          <input type="email" className={input} placeholder="new@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        </Field>
        <p className="mt-3 text-xs text-[var(--color-muted)]">We&rsquo;ll send a confirmation link to your new address. The change takes effect once you click it.</p>
      </Modal>

      <Modal
        open={passwordModal}
        onClose={() => setPasswordModal(false)}
        eyebrow="Change password"
        title="Update your password"
        footer={
          <>
            <button type="button" onClick={() => setPasswordModal(false)} className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-colors">Cancel</button>
            <button type="button" disabled={pending || !newPassword} onClick={handlePasswordChange} className="rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50">{pending ? "Updating…" : "Update"}</button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="New password" hint="Min 8 characters.">
            <input type="password" className={input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>
          <Field label="Confirm new password">
            <input type="password" className={input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={resetModal}
        onClose={() => { setResetModal(false); setResetConfirm(""); }}
        eyebrow="Reset progress"
        title="This clears every completed step"
        footer={
          <>
            <button type="button" onClick={() => { setResetModal(false); setResetConfirm(""); }} className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-colors">Cancel</button>
            <button
              type="button"
              disabled={resetConfirm !== data.firstName || pending}
              onClick={handleReset}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {pending ? "Resetting…" : "Reset progress"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
          Type <span className="font-mono font-medium text-[var(--color-ink)]">{data.firstName}</span> below to confirm. Documents stay; only step completion is cleared.
        </p>
        <div className="mt-4">
          <input value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} placeholder={data.firstName} className={input} />
        </div>
      </Modal>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        eyebrow="Delete account"
        title="30-day grace period applies"
        footer={
          <>
            <button type="button" onClick={() => setDeleteModal(false)} className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-colors">Cancel</button>
            <button type="button" disabled={pending} onClick={handleDelete} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50">
              {pending ? "Scheduling…" : "Delete account"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Reason (optional)">
            <select className={input} defaultValue="">
              <option value="" disabled>Select…</option>
              <option>Visa stamped — done</option>
              <option>Switching providers</option>
              <option>Too expensive</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Confirm email" hint="Type the email on file to confirm.">
            <input type="email" className={input} placeholder={data.email} value={deleteConfirmEmail} onChange={(e) => setDeleteConfirmEmail(e.target.value)} />
          </Field>
        </div>
        <p className="mt-3 text-xs text-[var(--color-muted)] leading-relaxed">
          Your data stays for 30 days. Sign in within that window to reactivate. After 30 days, everything is permanently deleted.
        </p>
      </Modal>

      <Modal
        open={refundModal}
        onClose={() => { setRefundModal(false); setRefundReason(""); }}
        eyebrow="Refund"
        title="14-day refund, no questions asked"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setRefundModal(false); setRefundReason(""); }}
              className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending || refundReason.trim().length < 10}
              onClick={handleRefund}
              className="rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50"
            >
              {pending ? "Sending…" : "Request refund"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
          If you&rsquo;re within 14 days of purchase we refund the full amount.
          After 14 days we still review on a case-by-case basis. Either way a
          person will respond within 24 hours.
        </p>
        <div className="mt-4">
          <Field label="Reason (helps us improve)">
            <textarea
              rows={4}
              minLength={10}
              maxLength={1000}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="What didn't work for you?"
              className={`${input} resize-y min-h-[88px]`}
            />
          </Field>
          <p className="mt-1.5 text-[11px] text-[var(--color-muted)] flex items-center justify-between">
            <span>Minimum 10 characters.</span>
            <span className="font-mono tabular-nums">{refundReason.length}/1000</span>
          </p>
        </div>
      </Modal>

      <Modal
        open={twoFAModal}
        onClose={() => {
          setTwoFAModal(false);
          setTwoFAEnrollment(null);
          setTwoFACode("");
          setTwoFAError(null);
        }}
        eyebrow="Two-factor authentication"
        title={
          twoFAEnabled
            ? "Two-factor authentication is on"
            : twoFAEnrollment
            ? "Verify the 6-digit code"
            : "Add an extra layer of protection"
        }
        footer={
          twoFAEnabled ? (
            <>
              <button
                type="button"
                onClick={() => setTwoFAModal(false)}
                className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={twoFABusy}
                onClick={removeTwoFA}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {twoFABusy ? "Removing…" : "Remove 2FA"}
              </button>
            </>
          ) : twoFAEnrollment ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setTwoFAEnrollment(null);
                  setTwoFACode("");
                  setTwoFAError(null);
                }}
                className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={twoFABusy || twoFACode.trim().length < 6}
                onClick={verifyEnroll}
                className="rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50"
              >
                {twoFABusy ? "Verifying…" : "Verify & enable"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setTwoFAModal(false)}
                className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={twoFABusy}
                onClick={startEnroll}
                className="rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50"
              >
                {twoFABusy ? "Starting…" : "Set up"}
              </button>
            </>
          )
        }
      >
        {twoFAEnabled ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            You&rsquo;ll be asked for a code from your authenticator app whenever you sign in. Remove
            2FA only if you&rsquo;ve lost access to that app.
          </p>
        ) : twoFAEnrollment ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-ink-soft)]">
              Open Google Authenticator, Authy, or 1Password and scan the QR. Then enter the 6-digit
              code below.
            </p>
            <div className="flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white p-4">
              {/* Supabase returns an SVG data URL, so an <img> is fine here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={twoFAEnrollment.qr}
                alt="Two-factor QR code"
                className="h-44 w-44"
              />
            </div>
            <p className="text-[11px] text-[var(--color-muted)] text-center font-mono break-all">
              Manual key: {twoFAEnrollment.secret}
            </p>
            <Field label="6-digit code">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={input}
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
            {twoFAError && (
              <p className="text-xs text-red-600">{twoFAError}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-ink-soft)]">
              Protect your account with a one-time code from an authenticator app (Google
              Authenticator, Authy, 1Password). After setup, you&rsquo;ll enter a fresh 6-digit code
              every time you sign in.
            </p>
            {twoFAError && (
              <p className="text-xs text-red-600">{twoFAError}</p>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="inline-flex items-center gap-3 rounded-xl bg-[var(--color-persimmon)] px-5 py-3 text-sm font-medium text-[var(--color-paper-soft)] shadow-[0_18px_40px_-15px_rgba(20,33,28,0.45)]">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function SaveRow({ show, section, saving, saved, onSave }: { show: boolean; section: string; saving: boolean; saved: boolean; onSave: () => void }) {
  if (!show && !saved) return null;
  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        onClick={onSave}
        disabled={saving || (!show && !saved)}
        className="inline-flex items-center justify-center rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-60"
        data-section={section}
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Family members — real seats now (supabase/migrations/0011_family_seats.
   sql), not the old hardcoded "Arya Patel / Riya Patel" mock. Owners can
   invite by email (revoking pending invites) and remove members; members
   can only leave. State comes from lib/family.ts via the settings page
   server component.
   ────────────────────────────────────────────────────────────────────── */
function FamilyMembersSection({ family }: { family?: FamilySummary }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const role = family?.role ?? "none";
  const seats = family?.seats ?? [];
  const pending = family?.pendingInvites ?? [];
  const maxSeats = family?.maxSeats ?? 2;
  const openSlots = Math.max(0, maxSeats - seats.length - pending.length);

  const runInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busyKey) return;
    setBusyKey("invite");
    setError(null);
    setNotice(null);
    const res = await inviteFamilyMember(email.trim());
    setBusyKey(null);
    if (res.ok) {
      setEmail("");
      setNotice("Invite sent.");
      router.refresh();
    } else {
      setError(res.error);
    }
  };

  const runRevoke = async (inviteId: string) => {
    setBusyKey(`revoke-${inviteId}`);
    setError(null);
    const res = await revokeFamilyInvite(inviteId);
    setBusyKey(null);
    if (res.ok) router.refresh();
    else setError(res.error);
  };

  const runRemove = async (userId: string) => {
    setBusyKey(`remove-${userId}`);
    setError(null);
    const res = await removeFamilyMember(userId);
    setBusyKey(null);
    if (res.ok) router.refresh();
    else setError(res.error);
  };

  const runLeave = async () => {
    setBusyKey("leave");
    setError(null);
    const res = await leaveFamilyGroup();
    setBusyKey(null);
    if (res.ok) router.refresh();
    else setError(res.error);
  };

  return (
    <div>
      <Eyebrow>Family members</Eyebrow>
      <ul className="mt-3 space-y-2">
        {seats.map((m) => (
          <li key={m.userId} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--color-ink)]">
              {m.firstName ?? "Student"}
              {m.isYou ? " (you)" : ""}
              {m.isOwner ? " · owner" : ""}
            </span>
            {role === "owner" && !m.isOwner ? (
              <button
                type="button"
                onClick={() => runRemove(m.userId)}
                disabled={busyKey === `remove-${m.userId}`}
                className="text-[11px] text-[var(--color-muted)] hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {busyKey === `remove-${m.userId}` ? "Removing…" : "Remove"}
              </button>
            ) : (
              <span className="text-[11px] text-[var(--color-muted)]">Active</span>
            )}
          </li>
        ))}
        {pending.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--color-ink-soft)]">{inv.email}</span>
            {role === "owner" ? (
              <button
                type="button"
                onClick={() => runRevoke(inv.id)}
                disabled={busyKey === `revoke-${inv.id}`}
                className="text-[11px] text-[var(--color-muted)] hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {busyKey === `revoke-${inv.id}` ? "Cancelling…" : "Cancel invite"}
              </button>
            ) : (
              <span className="text-[11px] text-[var(--color-muted)]">Invited</span>
            )}
          </li>
        ))}
        {Array.from({ length: openSlots }).map((_, i) => (
          <li key={`open-${i}`} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--color-muted)]">—</span>
            <span className="text-[11px] text-[var(--color-muted)]">Open slot</span>
          </li>
        ))}
      </ul>

      {role === "owner" && openSlots > 0 && (
        <form onSubmit={runInvite} className="mt-4 flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Student's email"
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
            disabled={busyKey === "invite"}
          />
          <button
            type="submit"
            disabled={busyKey === "invite" || !email.trim()}
            className="rounded-lg bg-[var(--color-persimmon)] px-4 py-2 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50"
          >
            {busyKey === "invite" ? "Sending…" : "Invite"}
          </button>
        </form>
      )}

      {role === "member" && (
        <button
          type="button"
          onClick={runLeave}
          disabled={busyKey === "leave"}
          className="mt-4 text-xs text-[var(--color-muted)] hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {busyKey === "leave" ? "Leaving…" : "Leave family plan"}
        </button>
      )}

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {notice && !error && <p className="mt-3 text-xs text-[var(--color-accent-deep)]">{notice}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Refer a friend — link + copy button + earned-rewards summary.
   Credit balances are formatted from the smallest currency unit the
   API stores them in (paise / cents), and both are shown so the user
   sees whatever they've actually accrued.
   ────────────────────────────────────────────────────────────────────── */
function ReferSection({ referral }: { referral?: ReferralProps }) {
  const [copied, setCopied] = useState(false);
  const link = referral?.link ?? "";
  const code = referral?.code ?? null;

  const fmtInr = (paise: number) =>
    `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const fmtUsd = (cents: number) =>
    `$${(cents / 100).toFixed(2)}`;

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can manually select */
    }
  };

  return (
    <section
      id="refer"
      className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-6 sm:p-7"
    >
      <h2 className="text-base font-medium text-[var(--color-ink)]">Refer a friend</h2>
      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
        Share your link. When a friend signs up + upgrades, they get 10% off and you earn ₹500 / $8 in credit.
      </p>

      {/* Share link */}
      <div className="mt-5">
        <span className="text-xs font-medium text-[var(--color-ink-soft)]">Your share link</span>
        <div className="mt-1.5 flex items-stretch gap-2">
          <input
            readOnly
            value={link || "Generating…"}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-mono text-[var(--color-ink)] outline-none"
          />
          <button
            type="button"
            onClick={copy}
            disabled={!link}
            className="rounded-xl bg-[var(--color-persimmon)] px-4 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        {code && (
          <p className="mt-2 text-[11px] text-[var(--color-muted)]">
            Your code: <span className="font-mono text-[var(--color-ink-soft)]">{code}</span>
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Friends referred"  value={referral?.totalReferred ?? 0} />
        <StatTile label="Rewards earned"    value={referral?.totalCompleted ?? 0} />
        <StatTile label="Credit (INR)"      value={fmtInr(referral?.creditInrPaise ?? 0)} />
        <StatTile label="Credit (USD)"      value={fmtUsd(referral?.creditUsdCents ?? 0)} />
      </div>

      <p className="mt-5 text-[11px] text-[var(--color-muted)] leading-relaxed">
        Credit is applied automatically at your next checkout. Self-referrals don&rsquo;t count;
        one credit per friend.
      </p>
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-paper)] p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">{label}</div>
      <div className="mt-1 font-display text-xl tracking-tight text-[var(--color-ink)] tabular-nums">{value}</div>
    </div>
  );
}
