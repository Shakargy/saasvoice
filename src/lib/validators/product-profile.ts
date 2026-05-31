import { z } from "zod";

import {
  PRODUCT_CATEGORIES,
  FOUNDER_TONES,
  POST_LENGTHS,
  PLATFORMS,
} from "@/lib/constants";

export const productProfileSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(1, "Product name is required.")
    .max(120, "Product name is too long."),
  websiteUrl: z
    .union([z.url("Enter a valid URL."), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  shortDescription: z
    .string()
    .trim()
    .min(1, "A short description helps generate better posts.")
    .max(500, "Keep the description under 500 characters."),
  targetAudience: z
    .string()
    .trim()
    .min(1, "Tell us who this is for.")
    .max(300, "Audience is too long."),
  category: z.enum(PRODUCT_CATEGORIES),
  founderTone: z.enum(FOUNDER_TONES),
  writingStyleNotes: z
    .string()
    .trim()
    .max(1000, "Writing notes are too long.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  bannedWords: z
    .string()
    .trim()
    .max(1000, "Banned words list is too long.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  preferredPostLength: z.enum(POST_LENGTHS),
  defaultPlatform: z.enum(PLATFORMS),
});

// Output (after transforms) — what the API and DB receive.
export type ProductProfileInput = z.infer<typeof productProfileSchema>;
// Input (what the form holds before transforms) — used to type useForm.
export type ProductProfileFormValues = z.input<typeof productProfileSchema>;
