import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { handler, readJson, requireUserId } from "@/lib/api";
import { productUpdateSchema } from "@/lib/validators/product-update";

async function getOwnedUpdate(id: string, userId: string) {
  const update = await prisma.productUpdate.findUnique({ where: { id } });
  if (!update || update.userId !== userId) return null;
  return update;
}

export const GET = handler(
  async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;
    const update = await getOwnedUpdate(id, userId);
    if (!update) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const posts = await prisma.generatedPost.findMany({
      where: { productUpdateId: id, userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ update, posts });
  }
);

export const PATCH = handler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;
    const update = await getOwnedUpdate(id, userId);
    if (!update) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await readJson(request);
    const parsed = productUpdateSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const updated = await prisma.productUpdate.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ update: updated });
  }
);

export const DELETE = handler(
  async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;
    const update = await getOwnedUpdate(id, userId);
    if (!update) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.productUpdate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
);
