import { describe, it, expect } from "vitest";

import {
  scorePost,
  countEmojis,
  countHashtags,
  countOccurrences,
  hasNumbers,
  GENERIC_PHRASES,
  BUZZWORDS,
} from "./scoring";

describe("helpers", () => {
  it("counts emojis", () => {
    expect(countEmojis("no emoji here")).toBe(0);
    expect(countEmojis("ship it 🚀")).toBe(1);
    expect(countEmojis("🚀🔥✨ hype")).toBe(3);
  });

  it("counts hashtags", () => {
    expect(countHashtags("clean post")).toBe(0);
    expect(countHashtags("#buildinpublic shipping")).toBe(1);
    expect(countHashtags("#saas #devtools #ai")).toBe(3);
    // A "#" mid-word (like a C# mention) should not count as a hashtag.
    expect(countHashtags("issue C#123")).toBe(0);
  });

  it("detects numbers", () => {
    expect(hasNumbers("reduced to 1.8s")).toBe(true);
    expect(hasNumbers("no digits at all")).toBe(false);
  });

  it("counts phrase occurrences", () => {
    expect(countOccurrences("excited to announce excited to announce", GENERIC_PHRASES)).toBe(2);
    expect(countOccurrences("plain text", BUZZWORDS)).toBe(0);
  });
});

describe("scorePost — generic AI content scores high generic / low human", () => {
  const generic =
    "🚀 Excited to announce a game-changer that will supercharge your workflow and unlock your potential! #innovation #disrupt";
  const result = scorePost(generic);

  it("flags it as mostly generic", () => {
    expect(result.finalAiGenericScore).toBeGreaterThan(60);
    expect(result.finalHumanScore).toBeLessThan(40);
  });

  it("raises the expected flags", () => {
    expect(result.flags).toContain("Starts with or uses a generic AI phrase");
    expect(result.flags.some((f) => f.toLowerCase().includes("buzzword"))).toBe(true);
  });

  it("explains why and suggests a fix", () => {
    expect(result.reasoning.toLowerCase()).toContain("generic");
    expect(result.suggestion.length).toBeGreaterThan(0);
  });
});

describe("scorePost — specific founder content scores low generic / high human", () => {
  const human =
    "First dashboard load was 6s because we fetched everything on mount. I cached the summary instead — now it's 1.8s. Small fix, big difference.";
  const result = scorePost(human);

  it("reads as human", () => {
    expect(result.finalHumanScore).toBeGreaterThan(55);
    expect(result.finalAiGenericScore).toBeLessThan(45);
  });

  it("rewards specificity (numbers + reasoning)", () => {
    expect(result.specificityScore).toBeGreaterThan(0);
  });

  it("does not raise the vague flag", () => {
    expect(result.flags).not.toContain("No concrete detail — too vague");
  });
});

describe("scorePost — comparative ordering", () => {
  it("ranks the human post as less generic than the AI post", () => {
    const ai = scorePost(
      "We are thrilled to announce a revolutionary, best-in-class solution to transform your business."
    );
    const human = scorePost(
      "Spent the morning ripping out a caching layer that caused more bugs than it prevented. Sometimes the fix is deleting code."
    );
    expect(human.finalAiGenericScore).toBeLessThan(ai.finalAiGenericScore);
    expect(human.finalHumanScore).toBeGreaterThan(ai.finalHumanScore);
  });
});

describe("scorePost — edge cases", () => {
  it("handles empty text without throwing", () => {
    const r = scorePost("");
    expect(r.finalAiGenericScore).toBeGreaterThanOrEqual(0);
    expect(r.finalAiGenericScore).toBeLessThanOrEqual(100);
    expect(r.finalHumanScore).toBeGreaterThanOrEqual(0);
  });

  it("penalizes emoji spam", () => {
    const clean = scorePost("Shipped a fix for the webhook retry bug today.");
    const spammy = scorePost("Shipped a fix for the webhook retry bug today 🚀🔥✨🎉💯");
    expect(spammy.emojiPenalty).toBeGreaterThan(clean.emojiPenalty);
  });

  it("penalizes hashtag spam", () => {
    const r = scorePost("Shipped it. #saas #devtools #buildinpublic #startup");
    expect(r.hashtagPenalty).toBeGreaterThan(0);
    expect(r.flags).toContain("Too many hashtags");
  });

  it("keeps all sub-scores within 0-100", () => {
    const r = scorePost(
      "Excited to announce game-changer revolutionary synergy paradigm 🚀🔥✨🎉 #a #b #c #d"
    );
    for (const key of [
      "genericPhrasePenalty",
      "buzzwordPenalty",
      "specificityScore",
      "humanToneScore",
      "hookStrengthScore",
      "hashtagPenalty",
      "emojiPenalty",
      "finalAiGenericScore",
      "finalHumanScore",
    ] as const) {
      expect(r[key]).toBeGreaterThanOrEqual(0);
      expect(r[key]).toBeLessThanOrEqual(100);
    }
  });
});
