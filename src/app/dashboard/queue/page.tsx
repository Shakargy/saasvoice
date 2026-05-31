import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PostCard, type PostView } from "@/components/posts/post-card";

export const metadata: Metadata = { title: "Queue" };

export default async function QueuePage() {
  const session = await auth();
  const userId = session!.user.id;

  const posts = await prisma.generatedPost.findMany({
    where: { userId, status: "queued" },
    orderBy: [{ plannedAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Content queue"
        description="Approved posts lined up to ship."
      />
      {posts.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Your queue is empty"
          description="Hit Queue on any generated post to line it up here. Copy or export it when you're ready to publish."
        />
      ) : (
        <div className="grid gap-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p as unknown as PostView} />
          ))}
        </div>
      )}
    </>
  );
}
