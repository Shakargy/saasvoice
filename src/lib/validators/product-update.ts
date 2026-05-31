import { z } from "zod";

import { UPDATE_TYPES, IMPORTANCE_LEVELS } from "@/lib/constants";

export const productUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give this update a short title.")
      .max(160, "Title is too long."),
    updateType: z.enum(UPDATE_TYPES),
    rawNotes: z
      .string()
      .trim()
      .min(1, "Add the raw notes you want turned into posts.")
      .max(4000, "Notes are too long."),
    importance: z.enum(IMPORTANCE_LEVELS),
    includeLink: z.boolean().default(false),
    linkUrl: z
      .union([z.url("Enter a valid URL."), z.literal("")])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  })
  .refine((data) => !data.includeLink || !!data.linkUrl, {
    message: "Add a link URL or turn off the link option.",
    path: ["linkUrl"],
  });

// Output (after transforms/defaults) — what the API and DB receive.
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
// Input (what the form holds before transforms) — used to type useForm.
export type ProductUpdateFormValues = z.input<typeof productUpdateSchema>;
