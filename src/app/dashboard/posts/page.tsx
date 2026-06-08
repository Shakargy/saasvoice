import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PostCard, type PostView } from "@/components/posts/post-card";
import { PostsFilter } from "@/components/posts/posts-filter";
import { ExportButton } from "@/components/posts/export-button";

export const metadata: Metadata = { title: "Posts" };

const TABS = [
  "all",
  "draft",
  "approved",
  "queued",
  "posted_manually",
  "archived",
] as const;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await auth();
  const userId = session!.user.id;

  const active = TABS.includes((status ?? "all") as (typeof TABS)[number])
    ? (status ?? "all")
    : "all";

  const where =
    active === "all" ? { userId } : { userId, status: active };

  const posts = await prisma.generatedPost.findMany({
    where,
    orderBy: [{ humanScore: "desc" }, { createdAt: "desc" }],
  });

  const total = await prisma.generatedPost.count({ where: { userId } });

  return (
    <>
      <PageHeader
        title="Posts"
        description="Every generated post, with its anti-AI voice score."
        action={posts.length > 0 ? <ExportButton /> : undefined}
      />

      {total === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No posts yet"
          description="Open a product update and hit Generate to create your first founder-style posts."
        />
      ) : (
        <div className="space-y-5">
          <PostsFilter active={active} />
          {posts.length === 0 ? (
            <EmptyState title={`No ${active} posts`} />
          ) : (
            <div className="grid gap-4">
              {posts.map((p) => (
                <PostCard key={p.id} post={p as unknown as PostView} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
