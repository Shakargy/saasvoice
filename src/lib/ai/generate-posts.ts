import type {
  AiProvider,
  GenerationContext,
  ProviderId,
  VariantKey,
} from "./types";
import { VARIANTS } from "./types";
import { MockProvider } from "./providers/mock";
import { GeminiProvider } from "./providers/gemini";
import { scorePost } from "./scoring";

/** A fully-scored post ready to persist / display. */
export type ScoredPost = {
  variantKey: VariantKey;
  variantName: string;
  platform: string;
  text: string;
  hook: string;
  hashtags: string[];
  estimatedCharacters: number;
  aiGenericScore: number;
  humanScore: number;
  reasoning: string;
  warnings: string[];
};

/** Resolve the active provider from env. Falls back to mock on any gap. */
export function getProvider(): AiProvider {
  const id = (process.env.AI_PROVIDER ?? "mock").toLowerCase() as ProviderId;

  if (id === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    if (key) return new GeminiProvider(key, process.env.GEMINI_MODEL);
    // No key → degrade gracefully to mock rather than erroring.
    console.warn("[ai] AI_PROVIDER=gemini but GEMINI_API_KEY missing; using mock.");
    return new MockProvider();
  }

  // groq | cerebras | openai | anthropic are reserved for future providers.
  return new MockProvider();
}

const VARIANT_NAME: Record<VariantKey, string> = Object.fromEntries(
  VARIANTS.map((v) => [v.key, v.name])
) as Record<VariantKey, string>;

/**
 * Generate + score posts for an update. The provider returns text only; every
 * score and warning here is computed deterministically by scoring.ts.
 */
export async function generateScoredPosts(
  context: GenerationContext,
  provider: AiProvider = getProvider()
): Promise<ScoredPost[]> {
  const response = await provider.generate(context);

  return response.posts.map((post) => {
    const score = scorePost(post.text, post.hook);

    const warnings = [...score.flags];
    // Link-in-post cost warning (platform APIs cost money later).
    if (context.update.includeLink && context.update.linkUrl) {
      warnings.push(
        "This post may include a link — future direct X posting with links can have higher API cost."
      );
    }
    // X length guard.
    if (post.platform === "X" && post.text.length > 280) {
      warnings.push("Over 280 characters for X — trim before posting.");
    }

    return {
      variantKey: post.variantKey,
      variantName: VARIANT_NAME[post.variantKey] ?? post.variantKey,
      platform: post.platform,
      text: post.text,
      hook: post.hook,
      hashtags: post.hashtags,
      estimatedCharacters: post.text.length,
      aiGenericScore: score.finalAiGenericScore,
      humanScore: score.finalHumanScore,
      reasoning: score.reasoning,
      warnings,
    };
  });
}
