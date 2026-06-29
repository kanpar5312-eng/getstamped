import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import {
  isElevenLabsConfigured,
  streamTts,
  type InterviewerVoice,
  type OfficerTone,
} from "@/lib/elevenlabs";

/* ════════════════════════════════════════════════════════════════════════
   POST /api/mock-interview/tts
   ──────────────────────────────────────────────────────────────────────
   Body: { text: string, interviewer: "female" | "male" }
   Response: audio/mpeg stream proxied from ElevenLabs.

   Auth: signed-in users only (anonymous TTS would let randoms burn the
   API budget). The mock-interview session itself is gated upstream by
   /api/mock-interview/start, so by the time the client hits this route
   the user has already paid the weekly-quota cost — no double-metering
   here, but we cap input length to keep one runaway request from
   eating the monthly char budget.
   ════════════════════════════════════════════════════════════════════════ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT_CHARS = 800;

type Body = { text?: string; interviewer?: string; tone?: string };

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  if (!isElevenLabsConfigured()) {
    return NextResponse.json({ error: "tts_not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const text = (body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (text.length > MAX_TEXT_CHARS) {
    return NextResponse.json({ error: "text too long" }, { status: 400 });
  }

  const interviewer: InterviewerVoice =
    body.interviewer === "male" ? "male" : "female";
  const tone: OfficerTone = body.tone === "strict" ? "strict" : "standard";

  let upstream: Response;
  try {
    upstream = await streamTts({ text, voice: interviewer, tone });
  } catch (err) {
    console.error("[tts] upstream call failed:", err);
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const msg = await upstream.text().catch(() => "");
    console.error("[tts] upstream status", upstream.status, msg.slice(0, 200));
    return NextResponse.json({ error: "tts_failed", status: upstream.status }, { status: 502 });
  }

  // Hand the MP3 stream straight to the browser. Cache-Control:no-store so
  // proxies don't fan-out the same audio (each user pays their own way).
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
