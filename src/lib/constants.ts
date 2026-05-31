// Shared domain enums. Kept as const arrays so they drive both Zod validation
// and the UI <Select> options without drifting apart.

export const PRODUCT_CATEGORIES = [
  "SaaS",
  "Devtool",
  "AI tool",
  "Marketplace",
  "Productivity",
  "Cybersecurity",
  "API / Infrastructure",
  "Other",
] as const;

export const FOUNDER_TONES = [
  "Technical founder",
  "Casual builder",
  "Bold startup founder",
  "Educational",
  "Transparent founder",
  "Premium B2B",
  "Funny but professional",
  "Investor-friendly",
  "Direct and no-fluff",
] as const;

export const POST_LENGTHS = ["short", "medium", "long"] as const;

export const PLATFORMS = ["X", "LinkedIn", "Both"] as const;

export const UPDATE_TYPES = [
  "Feature shipped",
  "Bug fixed",
  "Lesson learned",
  "Customer insight",
  "Founder thought",
  "Metric / milestone",
  "Changelog",
  "Launch",
  "Problem / solution",
  "Technical decision",
  "Weekly recap",
] as const;

export const IMPORTANCE_LEVELS = ["low", "medium", "high"] as const;

export const POST_STATUSES = [
  "draft",
  "approved",
  "queued",
  "posted_manually",
  "archived",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type FounderTone = (typeof FOUNDER_TONES)[number];
export type PostLength = (typeof POST_LENGTHS)[number];
export type Platform = (typeof PLATFORMS)[number];
export type UpdateType = (typeof UPDATE_TYPES)[number];
export type Importance = (typeof IMPORTANCE_LEVELS)[number];
export type PostStatus = (typeof POST_STATUSES)[number];

// Default free-tier monthly generation runs. Server reads the env at runtime;
// this is the fallback.
export const DEFAULT_FREE_MONTHLY_GENERATIONS = 30;
