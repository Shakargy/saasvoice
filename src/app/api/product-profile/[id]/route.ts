import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { handler, readJson, requireUserId } from "@/lib/api";
import { productProfileSchema } from "@/lib/validators/product-profile";

export const PATCH = handler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await params;

    // Ownership check — never update another user's profile.
    const existing = await prisma.productProfile.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await readJson(request);
    const parsed = productProfileSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const profile = await prisma.productProfile.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ profile });
  }
);
