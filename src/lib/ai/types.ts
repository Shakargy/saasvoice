import { z } from "zod";

import { PLATFORMS } from "@/lib/constants";

/** The five post angles SaaSVoice always generates. */
export const VARIANTS = [
  { key: "punchy", name: "Short punchy post" },
  { key: "founder_progress", name: "Founder progress post" },
  { key: "educational", name: "Educational insight post" },
  { key: "storytelling", name: "Storytelling post" },
  { key: "opinionated", name: "Opinionated / contrarian post" },
] as const;

export type VariantKey = (typeof VARIANTS)[number]["key"];

/**
 * What a provider must return per post. NOTE: providers return TEXT and
 * metadata only — scores are computed deterministically server-side
 * (see scoring.ts), never trusted from the model.
 */
export const aiPostSchema = z.object({
  variantKey: z.enum([
    "punchy",
    "founder_progress",
    "educational",
    "storytelling",
    "opinionated",
  ]),
  platform: z.enum(PLATFORMS).catch("X"),
  text: z.string().min(1).max(4000),
  hook: z.string().min(1).max(400),
  hashtags: z.array(z.string()).max(10).default([]),
});

export type AiPost = z.infer<typeof aiPostSchema>;

export const aiResponseSchema = z.object({
  posts: z.array(aiPostSchema).min(1).max(5),
});

export type AiResponse = z.infer<typeof aiResponseSchema>;

/** Inputs handed to a provider to build the prompt. */
export type GenerationContext = {
  product: {
    productName: string;
    shortDescription: string;
    targetAudience: string;
    category: string;
    founderTone: string;
    writingStyleNotes?: string | null;
    bannedWords?: string | null;
    preferredPostLength: string;
    defaultPlatform: string;
  };
  update: {
    title: string;
    updateType: string;
    rawNotes: string;
    importance: string;
    includeLink: boolean;
    linkUrl?: string | null;
  };
};

/** Provider contract. Implementations live in ./providers. */
export interface AiProvider {
  readonly name: string;
  generate(context: GenerationContext): Promise<AiResponse>;
}

/** Known provider ids. mock + gemini are implemented; the rest are stubs. */
export type ProviderId =
  | "mock"
  | "gemini"
  | "groq"
  | "cerebras"
  | "openai"
  | "anthropic";
