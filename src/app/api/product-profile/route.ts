import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserId, UnauthorizedError } from "@/lib/security";
import { productProfileSchema } from "@/lib/validators/product-profile";

export async function GET() {
  try {
    const userId = await requireUserId();
    const profile = await prisma.productProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ profile });
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

    // MVP: one product profile per user.
    const existing = await prisma.productProfile.findFirst({
      where: { userId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have a product profile." },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = productProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const profile = await prisma.productProfile.create({
      data: { userId, ...parsed.data },
    });
    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
