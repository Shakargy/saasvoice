import { NextResponse } from "next/server";

import { requireUserId, UnauthorizedError } from "@/lib/security";
import { getUsageSummary } from "@/lib/usage";

export async function GET() {
  try {
    const userId = await requireUserId();
    const usage = await getUsageSummary(userId);
    return NextResponse.json({ usage });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
