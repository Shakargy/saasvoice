import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { handler, requireUserId } from "@/lib/api";
import { getOwnedPost } from "@/lib/posts";

// Toggle a post between "posted manually" and back to "approved".
export const POST = handler(
  async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;
    const post = await getOwnedPost(id, userId);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const nextStatus =
      post.status === "posted_manually" ? "approved" : "posted_manually";

    const updated = await prisma.generatedPost.update({
      where: { id },
      data: { status: nextStatus },
    });
    return NextResponse.json({ post: updated });
  }
);
