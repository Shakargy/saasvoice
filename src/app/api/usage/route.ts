import { NextResponse } from "next/server";

import { handler, requireUserId } from "@/lib/api";
import { getUsageSummary } from "@/lib/usage";

export const GET = handler(async () => {
  const userId = await requireUserId();
  const usage = await getUsageSummary(userId);
  return NextResponse.json({ usage });
});
