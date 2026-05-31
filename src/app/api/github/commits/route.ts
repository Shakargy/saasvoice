import { NextResponse } from "next/server";

import { handler, requireUserId } from "@/lib/api";
import { rateLimit } from "@/lib/security";
import { parseRepo, fetchPublicCommits } from "@/lib/github";

// Fetch recent commits from a public repo to prefill an update.
export const GET = handler(async (request: Request) => {
  const userId = await requireUserId();

  // Protect the shared (unauthenticated) GitHub rate limit from abuse.
  const limited = rateLimit(`github:${userId}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many lookups. Wait a moment." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const repoInput = searchParams.get("repo") ?? "";
  const parsed = parseRepo(repoInput);
  if (!parsed) {
    return NextResponse.json(
      { error: "Enter a repo like github.com/owner/repo." },
      { status: 400 }
    );
  }

  const result = await fetchPublicCommits(parsed.owner, parsed.repo);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    repo: `${parsed.owner}/${parsed.repo}`,
    commits: result.commits,
  });
});
