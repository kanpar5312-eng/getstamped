import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PHASE_META, STEPS } from "@/lib/steps";

/**
 * POST /api/documents/interview-pdf
 *
 * Generates the user's "Interview Day" checklist PDF:
 *   • Cover page with student name + consulate + interview date
 *   • One section per phase listing every step + complete / pending status
 *   • Documents inventory: filename, step, uploaded date
 *
 * Pulls everything from the user's profile + step_progress + documents tables.
 * Returns application/pdf — the client downloads it directly.
 *
 * Paywall: paid plans only. Free tier gets 402.
 */
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Auth not configured." }, { status: 503 });
  }
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase unavailable." }, { status: 503 });

  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const userId = userData.user.id;

  const [{ data: profile }, { data: progressRows }, { data: docsRows }] = await Promise.all([
    sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
    sb.from("step_progress").select("step_number, status").eq("user_id", userId),
    sb.from("documents").select("name, filename, step_number, created_at").is("deleted_at", null).order("created_at", { ascending: false }),
  ]);

  if (profile?.plan === "free") {
    return NextResponse.json({ error: "Interview Day PDF is a paid-plan feature." }, { status: 402 });
  }

  const studentName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || "GetStamped student";
  const consulate = profile?.consulate ?? "—";
  const interviewDate = profile?.interview_date
    ? new Date(profile.interview_date).toLocaleDateString("en-US", { dateStyle: "long" })
    : "Date not set";

  const progressByStep = new Map<number, string>();
  (progressRows ?? []).forEach((r) => progressByStep.set(r.step_number, r.status));

  const pdf = await PDFDocument.create();
  pdf.setTitle("Interview Day — GetStamped");
  pdf.setAuthor("GetStamped");
  pdf.setSubject(`F-1 interview prep for ${studentName}`);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOb = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const cream = rgb(0.96, 0.94, 0.89);
  const forest = rgb(0.08, 0.23, 0.18);
  const ink = rgb(0.08, 0.13, 0.11);
  const muted = rgb(0.42, 0.46, 0.44);
  const border = rgb(0.89, 0.85, 0.78);

  const W = 612; // US Letter
  const H = 792;

  /* ---------- Cover page ---------- */
  let page = pdf.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
  page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: forest });

  page.drawText("GETSTAMPED", { x: 56, y: H - 60, size: 11, font: helvBold, color: forest });
  page.drawText("INTERVIEW DAY CHECKLIST", { x: 56, y: H - 76, size: 9, font: helv, color: muted });

  page.drawText(studentName, { x: 56, y: H - 180, size: 32, font: helvBold, color: ink });
  page.drawText(consulate, { x: 56, y: H - 215, size: 14, font: helvOb, color: muted });

  page.drawLine({ start: { x: 56, y: H - 240 }, end: { x: 200, y: H - 240 }, thickness: 1, color: forest });

  page.drawText("Interview", { x: 56, y: H - 280, size: 9, font: helvBold, color: muted });
  page.drawText(interviewDate, { x: 56, y: H - 300, size: 16, font: helv, color: ink });

  page.drawText("Program", { x: 280, y: H - 280, size: 9, font: helvBold, color: muted });
  page.drawText(profile?.program_type ?? "—", { x: 280, y: H - 300, size: 16, font: helv, color: ink });

  page.drawText("University", { x: 56, y: H - 340, size: 9, font: helvBold, color: muted });
  page.drawText(profile?.university ?? "—", { x: 56, y: H - 360, size: 16, font: helv, color: ink });

  page.drawText("Intake", { x: 280, y: H - 340, size: 9, font: helvBold, color: muted });
  page.drawText(profile?.intake_term ?? "—", { x: 280, y: H - 360, size: 16, font: helv, color: ink });

  const completedCount = (progressRows ?? []).filter((r) => r.status === "complete").length;
  page.drawText(`${completedCount} / 47 steps complete`, { x: 56, y: 100, size: 11, font: helv, color: muted });
  page.drawText("Generated " + new Date().toLocaleString("en-US"), { x: 56, y: 84, size: 9, font: helv, color: muted });

  /* ---------- Per-phase step pages ---------- */
  for (const ph of PHASE_META) {
    page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });

    page.drawText(`PHASE ${String(ph.number).padStart(2, "0")}`, { x: 56, y: H - 60, size: 10, font: helvBold, color: muted });
    page.drawText(ph.name, { x: 56, y: H - 90, size: 22, font: helvBold, color: ink });
    page.drawLine({ start: { x: 56, y: H - 105 }, end: { x: 156, y: H - 105 }, thickness: 1, color: forest });

    let y = H - 150;
    const phaseSteps = STEPS.filter((s) => s.phase === ph.number);
    for (const s of phaseSteps) {
      if (y < 80) {
        page = pdf.addPage([W, H]);
        page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
        y = H - 60;
      }
      const status = progressByStep.get(s.number) ?? "not_started";
      const tick = status === "complete" ? "■" : status === "in_progress" ? "◐" : "□";
      const tickColor = status === "complete" ? forest : muted;
      page.drawText(tick, { x: 56, y, size: 14, font: helvBold, color: tickColor });
      page.drawText(`${String(s.number).padStart(2, "0")}`, { x: 80, y, size: 10, font: helv, color: muted });
      page.drawText(s.title, { x: 110, y, size: 11, font: helv, color: ink });
      page.drawText(`${s.estimatedMinutes} min`, { x: W - 100, y, size: 9, font: helv, color: muted });
      page.drawLine({ start: { x: 56, y: y - 6 }, end: { x: W - 56, y: y - 6 }, thickness: 0.4, color: border });
      y -= 26;
    }
  }

  /* ---------- Documents inventory ---------- */
  if (docsRows && docsRows.length > 0) {
    page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
    page.drawText("DOCUMENTS ON FILE", { x: 56, y: H - 60, size: 10, font: helvBold, color: muted });
    page.drawText(`${docsRows.length} uploaded`, { x: 56, y: H - 90, size: 22, font: helvBold, color: ink });
    page.drawLine({ start: { x: 56, y: H - 105 }, end: { x: 156, y: H - 105 }, thickness: 1, color: forest });

    let y = H - 150;
    for (const d of docsRows) {
      if (y < 80) {
        page = pdf.addPage([W, H]);
        page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
        y = H - 60;
      }
      page.drawText("■", { x: 56, y, size: 12, font: helvBold, color: forest });
      page.drawText(d.name, { x: 78, y, size: 11, font: helv, color: ink });
      page.drawText(d.step_number ? `Step ${d.step_number}` : "Unfiled", { x: W - 200, y, size: 9, font: helv, color: muted });
      page.drawText(d.created_at ? new Date(d.created_at).toLocaleDateString("en-US") : "—", { x: W - 110, y, size: 9, font: helv, color: muted });
      page.drawLine({ start: { x: 56, y: y - 6 }, end: { x: W - 56, y: y - 6 }, thickness: 0.4, color: border });
      y -= 24;
    }
  }

  const bytes = await pdf.save();
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="interview-day.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
