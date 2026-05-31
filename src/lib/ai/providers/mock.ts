import type { AiProvider, AiResponse, GenerationContext } from "../types";

/**
 * Mock provider — no API key required (default for local + first deploy).
 *
 * It does NOT call a model. It composes believable founder-style posts from the
 * actual raw notes so the whole app (generate → score → save → export) is fully
 * demoable offline. It deliberately produces a mix of stronger and weaker posts
 * so the Anti-AI Voice Score has something to grade.
 */
export class MockProvider implements AiProvider {
  readonly name = "mock";

  async generate(context: GenerationContext): Promise<AiResponse> {
    const { product, update } = context;
    const notes = update.rawNotes.trim().replace(/\s+/g, " ");
    const firstSentence = notes.split(/(?<=[.!?])\s/)[0] ?? notes;
    const short = truncate(firstSentence, 200);
    const isX = product.defaultPlatform !== "LinkedIn";

    // Small artificial latency so loading states are visible in dev.
    await new Promise((r) => setTimeout(r, 350));

    return {
      posts: [
        {
          variantKey: "punchy",
          platform: "X",
          text: truncate(`${short}\n\nSmall change, real difference.`, 270),
          hook: short,
          hashtags: [],
        },
        {
          variantKey: "founder_progress",
          platform: isX ? "X" : "LinkedIn",
          text: `Progress update on ${product.productName}: ${lower(firstSentence)} Still rough in places, but it's working and I'm keeping at it.`,
          hook: `Progress update on ${product.productName}`,
          hashtags: [],
        },
        {
          variantKey: "educational",
          platform: "LinkedIn",
          text: `One thing I learned building ${product.productName}: ${lower(firstSentence)} If you're working on something similar, the detail that mattered was in the notes, not the headline.`,
          hook: `One thing I learned building ${product.productName}`,
          hashtags: [],
        },
        {
          variantKey: "storytelling",
          platform: "LinkedIn",
          text: `We had a problem worth fixing. ${firstSentence} So I dug in, made the change, and shipped it. Not glamorous — just the work.`,
          hook: `We had a problem worth fixing`,
          hashtags: [],
        },
        {
          variantKey: "opinionated",
          platform: "X",
          text: `Most teams overthink this. ${truncate(lower(firstSentence), 180)} Ship the unglamorous fix. Your users feel it more than the flashy stuff.`,
          hook: `Most teams overthink this`,
          hashtags: [],
        },
      ],
    };
  }
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + "…";
}

function lower(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toLowerCase() + t.slice(1) : t;
}
