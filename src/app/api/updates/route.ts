import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { handler, readJson, requireUserId } from "@/lib/api";
import { productUpdateSchema } from "@/lib/validators/product-update";

export const GET = handler(async () => {
  const userId = await requireUserId();
  const updates = await prisma.productUpdate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ updates });
});

export const POST = handler(async (request: Request) => {
  const userId = await requireUserId();

  // Must have a product profile first (and we attach the update to it).
  const profile = await prisma.productProfile.findFirst({ where: { userId } });
  if (!profile) {
    return NextResponse.json(
      { error: "Create a product profile first." },
      { status: 400 }
    );
  }

  const body = await readJson(request);
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
});
