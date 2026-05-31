import { z } from "zod";

import { POST_STATUSES } from "@/lib/constants";

/** Edit a post's text / hook / hashtags. */
export const updatePostSchema = z.object({
  text: z.string().trim().min(1).max(4000).optional(),
  hook: z.string().trim().min(1).max(400).optional(),
  hashtags: z.array(z.string().max(40)).max(10).optional(),
});

export const postStatusSchema = z.enum(POST_STATUSES);

/** Queue a post with an optional planned date/time. */
export const queuePostSchema = z.object({
  plannedAt: z.iso.datetime().optional().nullable(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type QueuePostInput = z.infer<typeof queuePostSchema>;
