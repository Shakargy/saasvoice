import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { handler, readJson, requireUserId } from "@/lib/api";
import { getOwnedPost } from "@/lib/posts";
import { queuePostSchema } from "@/lib/validators/post";

// Queue (or re-schedule) a post with an optional planned date/time.
export const POST = handler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;
    const post = await getOwnedPost(id, userId);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await readJson(request);
    const parsed = queuePostSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const updated = await prisma.generatedPost.update({
      where: { id },
      data: {
        status: "queued",
        plannedAt: parsed.data.plannedAt
          ? new Date(parsed.data.plannedAt)
          : post.plannedAt,
      },
    });
    return NextResponse.json({ post: updated });
  }
);
