import "server-only";

/* ════════════════════════════════════════════════════════════════════════
   ElevenLabs TTS client — server-side only. The API key never leaves the
   server; the route hands the audio stream straight to the browser as
   `audio/mpeg` so the client just instantiates an <audio> element.

   Two voices are configured via env:
     ELEVENLABS_VOICE_FEMALE  → Officer Reyes
     ELEVENLABS_VOICE_MALE    → the male officer (set to "Daniel" by default)

   Defaults match the voice IDs recommended in setup. Model is hard-coded
   to eleven_turbo_v2_5 — ~400ms latency, half the cost of multilingual_v2,
   audio quality is plenty for English consular voices.
   ════════════════════════════════════════════════════════════════════════ */

export type InterviewerVoice = "female" | "male";

const MODEL_ID = "eleven_turbo_v2_5";

// Sensible stock-voice fallbacks so the route doesn't 500 if the operator
// forgot to set the voice envs after pasting the API key. These are the
// public Sarah / Daniel voice IDs from ElevenLabs' default library.
const DEFAULT_VOICE_FEMALE = "EXAVITQu4vr4xnSDxMaL";
const DEFAULT_VOICE_MALE = "onwK4e9ZLuTAKqWW03F9";

function voiceIdFor(v: InterviewerVoice): string {
  if (v === "female") {
    return process.env.ELEVENLABS_VOICE_FEMALE || DEFAULT_VOICE_FEMALE;
  }
  return process.env.ELEVENLABS_VOICE_MALE || DEFAULT_VOICE_MALE;
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

/**
 * Calls the ElevenLabs TTS endpoint and returns the raw MP3 stream. The
 * caller is responsible for piping it into the HTTP response.
 *
 * Voice settings are tuned for a calm, deliberate consular tone:
 *   • stability 0.55      — steady, no swings
 *   • similarity_boost 0.8 — keep the picked voice's character
 *   • style 0.15           — small inflection, not flat
 */
export async function streamTts(opts: {
  text: string;
  voice: InterviewerVoice;
}): Promise<Response> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY not set");

  const voiceId = voiceIdFor(opts.voice);
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: opts.text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.8,
        style: 0.15,
        use_speaker_boost: true,
      },
    }),
  });

  return res;
}
