import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { handler, requireUserId } from "@/lib/api";
import { rateLimit } from "@/lib/security";
import { getUsageSummary, incrementUsage } from "@/lib/usage";
import { generateScoredPosts } from "@/lib/ai/generate-posts";
import type { GenerationContext } from "@/lib/ai/types";

export const POST = handler(
  async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;

    // Rate limit AI generation: 10 runs / minute / user.
    const limited = rateLimit(`generate:${userId}`, 10, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Slow down a moment, then try again." },
        { status: 429 }
      );
    }

    // Server-side usage enforcement (never trust the client).
    const usage = await getUsageSummary(userId);
    if (usage.reached) {
      return NextResponse.json(
        {
          error: `You've used all ${usage.limit} generation runs this month.`,
          usage,
        },
        { status: 402 }
      );
    }

    // Ownership: the update + its profile must belong to this user.
    const update = await prisma.productUpdate.findUnique({ where: { id } });
    if (!update || update.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const profile = await prisma.productProfile.findUnique({
      where: { id: update.productProfileId },
    });
    if (!profile || profile.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const context: GenerationContext = {
      product: {
        productName: profile.productName,
        shortDescription: profile.shortDescription,
        targetAudience: profile.targetAudience,
        category: profile.category,
        founderTone: profile.founderTone,
        writingStyleNotes: profile.writingStyleNotes,
        bannedWords: profile.bannedWords,
        preferredPostLength: profile.preferredPostLength,
        defaultPlatform: profile.defaultPlatform,
      },
      update: {
        title: update.title,
        updateType: update.updateType,
        rawNotes: update.rawNotes,
        importance: update.importance,
        includeLink: update.includeLink,
        linkUrl: update.linkUrl,
      },
    };

    let scored;
    try {
      scored = await generateScoredPosts(context);
    } catch (err) {
      console.error("[generate] provider error:", err);
      return NextResponse.json(
        { error: "Generation failed. Please try again." },
        { status: 502 }
      );
    }

    // Persist all variations, then count the run as ONE usage unit.
    const created = await prisma.$transaction(
      scored.map((p) =>
        prisma.generatedPost.create({
          data: {
            userId,
            productProfileId: profile.id,
            productUpdateId: update.id,
            variantName: p.variantName,
            platform: p.platform,
            text: p.text,
            hook: p.hook,
            hashtags: p.hashtags,
            estimatedCharacters: p.estimatedCharacters,
            aiGenericScore: p.aiGenericScore,
            humanScore: p.humanScore,
            reasoning: p.reasoning,
            warnings: p.warnings,
            status: "draft",
          },
        })
      )
    );

    await incrementUsage(userId, 1);
    const nextUsage = await getUsageSummary(userId);

    return NextResponse.json(
      { posts: created, usage: nextUsage },
      { status: 201 }
    );
  }
);
