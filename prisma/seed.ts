import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { scorePost } from "../src/lib/ai/scoring";

const prisma = new PrismaClient();

/**
 * Seeds a demo account so the app is explorable immediately.
 * Safe to run repeatedly — it upserts the demo user and skips if data exists.
 *
 * Demo login:  demo@saasvoice.dev  /  demo1234
 * Override with SEED_EMAIL / SEED_PASSWORD env vars.
 */
async function main() {
  const email = (process.env.SEED_EMAIL ?? "demo@saasvoice.dev").toLowerCase();
  const password = process.env.SEED_PASSWORD ?? "demo1234";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Demo Founder", passwordHash },
  });

  const existingProfile = await prisma.productProfile.findFirst({
    where: { userId: user.id },
  });
  if (existingProfile) {
    console.log(`Seed: demo user ${email} already set up. Nothing to do.`);
    return;
  }

  const profile = await prisma.productProfile.create({
    data: {
      userId: user.id,
      productName: "API Graveyard",
      websiteUrl: "https://example.com",
      shortDescription:
        "A SaaS tool that tracks API dependencies, detects risky API changes, and warns teams before deprecated APIs break production.",
      targetAudience: "SaaS founders, engineering teams, platform teams",
      category: "API / Infrastructure",
      founderTone: "Technical founder",
      writingStyleNotes: "Short sentences. Dry humour. No emojis.",
      bannedWords: "revolutionary, game-changer",
      preferredPostLength: "medium",
      defaultPlatform: "Both",
    },
  });

  const updates = [
    {
      title: "Zombie API detection",
      updateType: "Feature shipped",
      rawNotes:
        "Added Zombie API detection for endpoints that suddenly become active after long inactivity. Turns out dead endpoints coming back to life is a real signal something is wrong.",
      importance: "high",
    },
    {
      title: "Dashboard load: 6s to near-instant",
      updateType: "Bug fixed",
      rawNotes:
        "Improved dashboard load time from a slow initial load to a near-instant cached summary. We were fetching everything on mount; now it's a cached summary.",
      importance: "medium",
    },
    {
      title: "Webhook alerts for risky changelog changes",
      updateType: "Feature shipped",
      rawNotes:
        "Added webhook alerts so teams get pinged when a dependency ships a risky changelog change, instead of finding out in production.",
      importance: "medium",
    },
    {
      title: "Free and pro usage limits",
      updateType: "Technical decision",
      rawNotes:
        "Built usage limits for free and pro plans. Decided to count one generation run as one unit instead of per-output, so it feels fair.",
      importance: "low",
    },
    {
      title: "API dependency graph summary",
      updateType: "Feature shipped",
      rawNotes:
        "Added an API dependency graph summary so teams can see at a glance which services depend on which APIs.",
      importance: "high",
    },
  ];

  for (const u of updates) {
    await prisma.productUpdate.create({
      data: {
        userId: user.id,
        productProfileId: profile.id,
        includeLink: false,
        ...u,
      },
    });
  }

  // Generate a couple of demo posts (scored deterministically) for the first update.
  const firstUpdate = await prisma.productUpdate.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  if (firstUpdate) {
    const samples = [
      {
        variantName: "Short punchy post",
        platform: "X",
        text: "Shipped Zombie API detection today. Dead endpoints that suddenly wake up are almost always a sign something's wrong. Now we catch them.",
        hook: "Shipped Zombie API detection today",
      },
      {
        variantName: "Opinionated / contrarian post",
        platform: "X",
        text: "🚀 Excited to announce a revolutionary, game-changing feature that will supercharge your workflow! #innovation #disrupt",
        hook: "Excited to announce",
      },
    ];

    for (const s of samples) {
      const score = scorePost(s.text, s.hook);
      await prisma.generatedPost.create({
        data: {
          userId: user.id,
          productProfileId: profile.id,
          productUpdateId: firstUpdate.id,
          variantName: s.variantName,
          platform: s.platform,
          text: s.text,
          hook: s.hook,
          hashtags: [],
          estimatedCharacters: s.text.length,
          aiGenericScore: score.finalAiGenericScore,
          humanScore: score.finalHumanScore,
          reasoning: score.reasoning,
          warnings: score.flags,
          status: "draft",
        },
      });
    }
  }

  console.log(`Seed complete. Login: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
