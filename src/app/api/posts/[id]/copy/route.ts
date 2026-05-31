import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { handler, requireUserId } from "@/lib/api";
import { getOwnedPost } from "@/lib/posts";

// Records that the user copied a post (for "copied" timestamps / analytics).
export const POST = handler(
  async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;
    const post = await getOwnedPost(id, userId);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.generatedPost.update({
      where: { id },
      data: { copiedAt: new Date() },
    });
    return NextResponse.json({ post: updated });
  }
);
