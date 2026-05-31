import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserId, UnauthorizedError } from "@/lib/security";
import { productUpdateSchema } from "@/lib/validators/product-update";

export async function GET() {
  try {
    const userId = await requireUserId();
    const updates = await prisma.productUpdate.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ updates });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    // Must have a product profile first (and we attach the update to it).
    const profile = await prisma.productProfile.findFirst({
      where: { userId },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Create a product profile first." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const update = await prisma.productUpdate.create({
      data: { userId, productProfileId: profile.id, ...parsed.data },
    });
    return NextResponse.json({ update }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
