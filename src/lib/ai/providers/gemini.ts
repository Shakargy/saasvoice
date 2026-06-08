import type { AiProvider, AiResponse, GenerationContext } from "../types";
import { aiResponseSchema } from "../types";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts/saasvoice-post-prompt";

/**
 * Gemini provider (Google AI Studio free tier). Uses the REST API directly so
 * we don't add an SDK dependency. Requires GEMINI_API_KEY; model is configurable
 * via GEMINI_MODEL (defaults to a free-tier-friendly flash model).
 *
 * The model returns TEXT only — scoring happens server-side afterwards.
 */
export class GeminiProvider implements AiProvider {
  readonly name = "gemini";
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || "gemini-flash-latest";
  }

  async generate(context: GenerationContext): Promise<AiResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: buildUserPrompt(context) }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `Gemini request failed (${res.status}). ${detail.slice(0, 200)}`
      );
    }

    const json = (await res.json()) as GeminiResponse;
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) throw new Error("Gemini returned an empty response.");

    const parsed = aiResponseSchema.safeParse(extractJson(text));
    if (!parsed.success) {
      throw new Error("Gemini returned JSON that did not match the schema.");
    }
    return parsed.data;
  }
}

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

/** Pull a JSON object out of a string, tolerating stray markdown fences. */
function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Could not parse JSON from Gemini response.");
  }
}
