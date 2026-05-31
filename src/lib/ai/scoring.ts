/**
 * Anti-AI Voice Score — deterministic, the single source of truth.
 *
 * The AI provider returns post TEXT only. This module scores it server-side so
 * results are consistent, free, testable, and identical in mock mode. Nothing
 * here calls a model.
 *
 * Two headline numbers:
 *  - aiGenericScore (0-100): higher = more generic / more "ChatGPT wrote this".
 *  - humanScore     (0-100): higher = more specific / credible / founder-like.
 * They are not forced to sum to 100, but move in opposite directions.
 */

// Phrases that scream "generic AI marketing". Lowercased, matched as substrings.
export const GENERIC_PHRASES = [
  "excited to announce",
  "we are thrilled",
  "we're thrilled",
  "thrilled to share",
  "game-changer",
  "game changer",
  "revolutionary",
  "leverage cutting-edge",
  "cutting-edge",
  "unlock your potential",
  "unlock the power",
  "supercharge your workflow",
  "supercharge",
  "in today's fast-paced world",
  "in todays fast-paced world",
  "seamlessly",
  "seamless integration",
  "transform your business",
  "take it to the next level",
  "we are excited to",
  "we're excited to",
  "elevate your",
  "empower your",
  "delighted to announce",
  "proud to announce",
  "the future of",
  "look no further",
  "in this day and age",
];

// Buzzwords that, in volume, make a post feel like corporate filler.
export const BUZZWORDS = [
  "synergy",
  "paradigm",
  "disrupt",
  "disruptive",
  "innovative",
  "innovation",
  "scalable",
  "robust",
  "best-in-class",
  "world-class",
  "next-generation",
  "next-gen",
  "state-of-the-art",
  "holistic",
  "frictionless",
  "turnkey",
  "bleeding-edge",
  "mission-critical",
  "value-add",
  "actionable",
  "ecosystem",
  "leverage",
  "streamline",
  "optimize",
  "empower",
  "revolutionize",
];

// Signals of concrete, founder-grade specificity.
const CONCRETE_HINTS = [
  "because",
  "so that",
  "instead of",
  "turns out",
  "the fix",
  "the bug",
  "the tradeoff",
  "trade-off",
  "we shipped",
  "i shipped",
  "i built",
  "we built",
  "took",
  "reduced",
  "dropped",
  "went from",
  "before",
  "after",
];

const STRONG_HOOK_STARTERS = [
  "i ",
  "we ",
  "most ",
  "everyone ",
  "nobody ",
  "stop ",
  "here's ",
  "heres ",
  "the ",
  "why ",
  "how ",
  "what ",
  "yesterday",
  "today",
  "last week",
];

export type ScoreBreakdown = {
  genericPhrasePenalty: number;
  buzzwordPenalty: number;
  specificityScore: number;
  humanToneScore: number;
  hookStrengthScore: number;
  hashtagPenalty: number;
  emojiPenalty: number;
  finalAiGenericScore: number;
  finalHumanScore: number;
};

export type ScoreResult = ScoreBreakdown & {
  flags: string[];
  /** Short human-readable explanation, e.g. "72% generic because…". */
  reasoning: string;
  /** One concrete suggestion to improve the post. */
  suggestion: string;
};

const EMOJI_REGEX =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function countOccurrences(haystack: string, needles: string[]): number {
  let count = 0;
  for (const needle of needles) {
    let idx = haystack.indexOf(needle);
    while (idx !== -1) {
      count += 1;
      idx = haystack.indexOf(needle, idx + needle.length);
    }
  }
  return count;
}

export function countEmojis(text: string): number {
  const matches = text.match(EMOJI_REGEX);
  return matches ? matches.length : 0;
}

export function countHashtags(text: string): number {
  const matches = text.match(/(^|\s)#[\w-]+/g);
  return matches ? matches.length : 0;
}

export function hasNumbers(text: string): boolean {
  return /\d/.test(text);
}

/**
 * Score a single post. `hook` is optional; if omitted we use the first line of
 * the text as the hook for the hook-strength heuristic.
 */
export function scorePost(text: string, hook?: string): ScoreResult {
  const raw = (text ?? "").trim();
  const lower = raw.toLowerCase();
  const words = raw.split(/\s+/).filter(Boolean);
  const wordCount = words.length || 1;
  const effectiveHook = (hook?.trim() || raw.split("\n")[0] || "").toLowerCase();

  // --- Penalties (push generic up) -------------------------------------------
  const genericHits = countOccurrences(lower, GENERIC_PHRASES);
  const genericPhrasePenalty = clamp(genericHits * 22);

  const buzzwordHits = countOccurrences(lower, BUZZWORDS);
  // Density-aware: buzzwords hurt more in short posts.
  const buzzwordDensity = buzzwordHits / wordCount;
  const buzzwordPenalty = clamp(buzzwordHits * 10 + buzzwordDensity * 120);

  const emojiCount = countEmojis(raw);
  const emojiPenalty = clamp(Math.max(0, emojiCount - 1) * 12);

  const hashtagCount = countHashtags(raw);
  const hashtagPenalty = clamp(Math.max(0, hashtagCount - 1) * 12);

  // --- Positive signals (push human up) --------------------------------------
  const concreteHits = countOccurrences(lower, CONCRETE_HINTS);
  const numberBonus = hasNumbers(raw) ? 18 : 0;
  const specificityScore = clamp(concreteHits * 14 + numberBonus);

  // First-person + reasonable length reads as a real person, not a brand.
  const firstPerson = /\b(i|we|my|our|i'm|we're|i've|we've)\b/i.test(raw);
  const lengthOk = wordCount >= 12 && wordCount <= 280;
  const humanToneScore = clamp(
    (firstPerson ? 40 : 0) +
      (lengthOk ? 25 : 0) +
      (concreteHits > 0 ? 20 : 0) +
      (genericHits === 0 ? 15 : 0)
  );

  const hookStarterOk = STRONG_HOOK_STARTERS.some((s) =>
    effectiveHook.startsWith(s)
  );
  const hookStartsGeneric = GENERIC_PHRASES.some((p) =>
    effectiveHook.startsWith(p)
  );
  const hookLen = effectiveHook.split(/\s+/).filter(Boolean).length;
  const hookStrengthScore = clamp(
    (hookStarterOk ? 45 : 15) +
      (hookLen >= 4 && hookLen <= 18 ? 30 : 0) +
      (hookStartsGeneric ? -40 : 15) +
      (hasNumbers(effectiveHook) ? 10 : 0)
  );

  // --- Combine ---------------------------------------------------------------
  const penalties =
    genericPhrasePenalty * 0.4 +
    buzzwordPenalty * 0.25 +
    emojiPenalty * 0.2 +
    hashtagPenalty * 0.15;

  const positives =
    specificityScore * 0.4 + humanToneScore * 0.35 + hookStrengthScore * 0.25;

  // Generic risk rises with penalties and falls with positives.
  const finalAiGenericScore = clamp(Math.round(35 + penalties - positives * 0.5));
  const finalHumanScore = clamp(Math.round(positives - penalties * 0.5));

  // --- Flags, reasoning, suggestion ------------------------------------------
  const flags: string[] = [];
  if (genericHits > 0) flags.push("Starts with or uses a generic AI phrase");
  if (buzzwordHits >= 2) flags.push("Too many buzzwords");
  if (buzzwordHits >= 1 && buzzwordHits < 2) flags.push("Contains corporate buzzwords");
  if (concreteHits === 0 && !hasNumbers(raw))
    flags.push("No concrete detail — too vague");
  if (!firstPerson) flags.push("No founder perspective (no I/we)");
  if (emojiCount > 2) flags.push("Too many emojis");
  if (hashtagCount > 1) flags.push("Too many hashtags");
  if (!hookStarterOk || hookStartsGeneric) flags.push("Weak hook");
  if (/!{2,}/.test(raw) || /excited|thrilled|amazing|incredible/i.test(lower))
    flags.push("Fake-sounding excitement");
  if (wordCount < 12) flags.push("Too short to say anything specific");

  const reasoning = buildReasoning(finalAiGenericScore, flags);
  const suggestion = buildSuggestion(flags, { hasNumbers: hasNumbers(raw), firstPerson });

  return {
    genericPhrasePenalty,
    buzzwordPenalty,
    specificityScore,
    humanToneScore,
    hookStrengthScore,
    hashtagPenalty,
    emojiPenalty,
    finalAiGenericScore,
    finalHumanScore,
    flags,
    reasoning,
    suggestion,
  };
}

function buildReasoning(genericScore: number, flags: string[]): string {
  if (genericScore <= 25) {
    return `This reads as genuinely human (${genericScore}% generic). It sounds like a founder, not a marketing bot.`;
  }
  if (genericScore <= 55) {
    const why = flags[0] ? ` — mainly: ${flags[0].toLowerCase()}` : "";
    return `Some risk here (${genericScore}% generic)${why}. A few tweaks would sharpen it.`;
  }
  const why = flags.slice(0, 2).map((f) => f.toLowerCase()).join(" and ");
  return `This sounds ${genericScore}% generic${why ? `, mostly because it ${why}` : ""}. It reads like AI wrote it.`;
}

function buildSuggestion(
  flags: string[],
  ctx: { hasNumbers: boolean; firstPerson: boolean }
): string {
  if (flags.includes("Starts with or uses a generic AI phrase"))
    return "Cut the announcement opener. Start with the actual thing you changed.";
  if (flags.includes("No concrete detail — too vague"))
    return "Name the exact bug, feature, tradeoff, or lesson. Specifics make it credible.";
  if (flags.includes("Too many buzzwords"))
    return "Swap the buzzwords for plain language a teammate would actually use.";
  if (!ctx.firstPerson)
    return "Write it from your perspective — what you did, what you learned.";
  if (flags.includes("Weak hook"))
    return "Open with a sharper first line — a result, a tension, or a blunt claim.";
  if (!ctx.hasNumbers)
    return "If you have a real number (time saved, before/after), add it — but don't invent one.";
  return "Solid. Read it aloud once; if any phrase sounds like a brand, make it yours.";
}
