import type { GenerationContext } from "../types";

export const SYSTEM_PROMPT = `You are an expert founder-led SaaS content strategist. You write specific, sharp, human posts for SaaS founders. You avoid generic AI language, fake claims, exaggerated marketing, and corporate fluff. You turn raw product updates into credible posts that sound like they came from a real founder building a real product.

Hard rules:
- Do NOT invent facts, metrics, customers, revenue, funding, or testimonials.
- If the user gives no numbers, do not create numbers.
- Never use these phrases: "excited to announce", "we're thrilled", "game-changer", "revolutionary", "leverage cutting-edge", "unlock your potential", "supercharge your workflow", "in today's fast-paced world", "seamlessly", "transform your business".
- Prefer concrete, specific founder details pulled from the raw notes.
- Sound like one real person talking, not a brand account.
- For X, keep posts under 280 characters. For LinkedIn, a bit longer is fine.
- Return VALID JSON ONLY, matching the requested schema. No markdown, no commentary.`;

/** Builds the user-message portion of the prompt from the generation context. */
export function buildUserPrompt(ctx: GenerationContext): string {
  const { product, update } = ctx;

  const platformLine =
    product.defaultPlatform === "Both"
      ? "Generate a mix: lean X for punchy/opinionated, LinkedIn for storytelling/educational."
      : `Target platform: ${product.defaultPlatform}.`;

  const banned = product.bannedWords?.trim()
    ? `Also avoid these banned words: ${product.bannedWords}.`
    : "";

  const style = product.writingStyleNotes?.trim()
    ? `Writing style notes: ${product.writingStyleNotes}.`
    : "";

  const link = update.includeLink && update.linkUrl
    ? `A link may be included: ${update.linkUrl}. Only add it if it reads naturally.`
    : "Do not invent or add any link.";

  return `PRODUCT
- Name: ${product.productName}
- Description: ${product.shortDescription}
- Audience: ${product.targetAudience}
- Category: ${product.category}
- Founder tone: ${product.founderTone}
- Preferred length: ${product.preferredPostLength}
${style ? `- ${style}` : ""}
${banned ? `- ${banned}` : ""}

PRODUCT UPDATE
- Title: ${update.title}
- Type: ${update.updateType}
- Importance: ${update.importance}
- Raw notes: ${update.rawNotes}

TASK
Write 5 different post variations from the update above, one of each:
1. punchy — short, sharp X post
2. founder_progress — a genuine progress update from the founder's view
3. educational — teach one concrete thing from this update
4. storytelling — a short narrative (problem → what you did → result)
5. opinionated — a confident, slightly contrarian take grounded in the update

${platformLine}
${link}

Return JSON ONLY in this exact shape:
{
  "posts": [
    {
      "variantKey": "punchy" | "founder_progress" | "educational" | "storytelling" | "opinionated",
      "platform": "X" | "LinkedIn",
      "text": "the full post text",
      "hook": "the first line / hook",
      "hashtags": ["optional", "few"]
    }
  ]
}
Include exactly one post per variantKey. Keep hashtags minimal (0-2). No commentary outside the JSON.`;
}
