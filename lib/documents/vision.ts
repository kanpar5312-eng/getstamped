import "server-only";
import { getGroq } from "@/lib/groq";
import type { ChecklistItem } from "@/lib/documents/checklist";

const VISION_MODEL = "llama-3.2-90b-vision-preview";

export type AiFeedback = {
  matches_expected: boolean;
  issues: { severity: "blocker" | "warning"; message: string }[];
  extracted: { expiry_date?: string; name?: string };
};

function buildSystem(countryName: string, visaType: string): string {
  return `You are an expert ${countryName} ${visaType} document reviewer.
You will be shown ONE image (or the first page of a PDF rendered as an image)
and told what document type it is supposed to be.

Your job:
1. Decide whether the image actually matches the expected document type.
2. Check legibility (blur, glare, cut-off edges, missing corners).
3. Check that the listed required visual elements are visible.
4. If asked, extract the expiry date (format YYYY-MM-DD).

You MUST reply with ONLY valid JSON in this exact shape:
{
  "matches_expected": boolean,
  "issues": [{"severity": "blocker" | "warning", "message": "plain-language sentence"}],
  "extracted": {"expiry_date": "YYYY-MM-DD or omit", "name": "string or omit"}
}

Rules:
- "blocker" = the document cannot be used as-is (wrong document, illegible, missing required field).
- "warning" = usable but should be improved (slight glare, edges close to the crop).
- Each "message" must be a single short sentence written FOR the student, e.g.
  "The bottom edge is cut off — re-scan with all four corners visible."
- If the document matches and is fully legible with no warnings, return an empty issues array.
- Do NOT use the word "verified". Do NOT promise visa approval.
- Output JSON only. No markdown, no preamble.`;
}

function buildUserPrompt(item: ChecklistItem): string {
  return [
    `Expected document: ${item.display_name}.`,
    `Description: ${item.aiExpectations.documentDescription}`,
    `Required visual elements:`,
    ...item.aiExpectations.requiredElements.map((e) => ` - ${e}`),
    item.aiExpectations.checkExpiry
      ? `Also extract the expiry date if present.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Run the vision check. `imageDataUrl` must be a data URL (data:image/...;base64,...)
 * or an https URL the model can fetch (we use signed URLs from Storage).
 * Returns null if Groq isn't configured or the model errors out.
 */
export async function checkDocument(
  item: ChecklistItem,
  imageUrl: string,
  /**
   * Optional destination-country context. F-1 preservation: omit to fall back
   * to "U.S. F-1 Student Visa" — the original, unchanged behavior.
   */
  context?: { countryName?: string; visaType?: string },
): Promise<AiFeedback | null> {
  const groq = getGroq();
  if (!groq) return null;

  const countryName = context?.countryName ?? "U.S.";
  const visaType = context?.visaType ?? "F-1 Student Visa";

  try {
    const completion = await groq.chat.completions.create({
      model: VISION_MODEL,
      temperature: 0.1,
      max_tokens: 600,
      messages: [
        { role: "system", content: buildSystem(countryName, visaType) },
        {
          role: "user",
          content: [
            { type: "text", text: buildUserPrompt(item) },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const json = extractJson(raw);
    if (!json) return null;
    const parsed = JSON.parse(json) as AiFeedback;
    // Defensive shape coercion
    return {
      matches_expected: Boolean(parsed.matches_expected),
      issues: Array.isArray(parsed.issues)
        ? parsed.issues
            .filter((i) => i && typeof i.message === "string")
            .map((i) => ({
              severity: i.severity === "blocker" ? "blocker" : "warning",
              message: String(i.message),
            }))
        : [],
      extracted:
        parsed.extracted && typeof parsed.extracted === "object" ? parsed.extracted : {},
    };
  } catch {
    return null;
  }
}

function extractJson(s: string): string | null {
  const trimmed = s.trim();
  if (trimmed.startsWith("{")) return trimmed;
  // Look for a JSON block inside ``` fences or after a preamble
  const fence = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fence) return fence[1];
  const obj = trimmed.match(/\{[\s\S]*\}/);
  return obj ? obj[0] : null;
}
