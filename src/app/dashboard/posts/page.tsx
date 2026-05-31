import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Posts" };

export default function PostsPage() {
  return (
    <>
      <PageHeader
        title="Posts"
        description="Generated posts you've saved, approved, or queued."
      />
      <EmptyState
        icon={Sparkles}
        title="Post management is coming next"
        description="Once AI generation is wired up, your saved posts — with anti-AI scores, editing, copy, and CSV export — will live here."
      />
    </>
  );
}
