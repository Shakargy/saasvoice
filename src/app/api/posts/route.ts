import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { handler, requireUserId } from "@/lib/api";
import { POST_STATUSES } from "@/lib/constants";

export const GET = handler(async (request: Request) => {
  const userId = await requireUserId();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: { userId: string; status?: string } = { userId };
  if (status && (POST_STATUSES as readonly string[]).includes(status)) {
    where.status = status;
  }

  const posts = await prisma.generatedPost.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json({ posts });
});
