import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { handler, readJson, requireUserId } from "@/lib/api";
import { getOwnedPost } from "@/lib/posts";
import { updatePostSchema } from "@/lib/validators/post";
import { scorePost } from "@/lib/ai/scoring";

export const PATCH = handler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;
    const post = await getOwnedPost(id, userId);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await readJson(request);
    const parsed = updatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    // If the text changed, re-score it (scores stay server-authoritative).
    const nextText = parsed.data.text ?? post.text;
    const nextHook = parsed.data.hook ?? post.hook;
    const rescore =
      parsed.data.text !== undefined || parsed.data.hook !== undefined;
    const score = rescore ? scorePost(nextText, nextHook) : null;

    const updated = await prisma.generatedPost.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(score
          ? {
              estimatedCharacters: nextText.length,
              aiGenericScore: score.finalAiGenericScore,
              humanScore: score.finalHumanScore,
              reasoning: score.reasoning,
            }
          : {}),
      },
    });
    return NextResponse.json({ post: updated });
  }
);

export const DELETE = handler(
  async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;
    const post = await getOwnedPost(id, userId);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.generatedPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
);
