import { prisma } from "@/lib/db";
import { DEFAULT_FREE_MONTHLY_GENERATIONS } from "@/lib/constants";

/** Calendar month key like "2026-05". Used to bucket usage per user. */
export function currentMonthKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function freeMonthlyLimit(): number {
  const fromEnv = Number(process.env.FREE_MONTHLY_GENERATIONS);
  return Number.isFinite(fromEnv) && fromEnv > 0
    ? fromEnv
    : DEFAULT_FREE_MONTHLY_GENERATIONS;
}

export type UsageSummary = {
  monthKey: string;
  used: number;
  limit: number;
  remaining: number;
  reached: boolean;
};

/** Read-only usage snapshot for the current month. */
export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const monthKey = currentMonthKey();
  const usage = await prisma.usage.findUnique({
    where: { userId_monthKey: { userId, monthKey } },
  });
  const limit = freeMonthlyLimit();
  const used = usage?.generatedPostsCount ?? 0;
  const remaining = Math.max(0, limit - used);
  return { monthKey, used, limit, remaining, reached: used >= limit };
}

/**
 * Atomically increment usage for this month after a successful generation run.
 * One run = one unit regardless of how many variations were produced.
 */
export async function incrementUsage(userId: string, by = 1): Promise<void> {
  const monthKey = currentMonthKey();
  await prisma.usage.upsert({
    where: { userId_monthKey: { userId, monthKey } },
    create: { userId, monthKey, generatedPostsCount: by },
    update: { generatedPostsCount: { increment: by } },
  });
}
