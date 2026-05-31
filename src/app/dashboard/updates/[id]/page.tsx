import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import { ArrowLeft, Sparkles, LinkIcon } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUsageSummary } from "@/lib/usage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { UpdateDialog } from "@/components/dashboard/update-dialog";
import { DeleteUpdateButton } from "@/components/dashboard/delete-update-button";
import { GenerateButton } from "@/components/dashboard/generate-button";
import { PostCard, type PostView } from "@/components/posts/post-card";
import type { ProductUpdateFormValues } from "@/lib/validators/product-update";

export const metadata: Metadata = { title: "Update" };

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const update = await prisma.productUpdate.findUnique({ where: { id } });
  if (!update || update.userId !== userId) notFound();

  const [posts, usage] = await Promise.all([
    prisma.generatedPost.findMany({
      where: { productUpdateId: id, userId },
      orderBy: [{ humanScore: "desc" }, { createdAt: "desc" }],
    }),
    getUsageSummary(userId),
  ]);

  const initial = {
    id: update.id,
    title: update.title,
    updateType: update.updateType,
    rawNotes: update.rawNotes,
    importance: update.importance,
    includeLink: update.includeLink,
    linkUrl: update.linkUrl ?? "",
  } as ProductUpdateFormValues & { id: string };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
        <Link href="/dashboard/updates">
          <ArrowLeft /> Back to updates
        </Link>
      </Button>

      <PageHeader
        title={update.title}
        action={
          <div className="flex gap-2">
            <UpdateDialog initial={initial} trigger="edit" />
            <DeleteUpdateButton id={update.id} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Raw notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm whitespace-pre-wrap">{update.rawNotes}</p>
            {update.includeLink && update.linkUrl && (
              <div className="flex items-center gap-2 text-sm">
                <LinkIcon className="size-4 text-muted-foreground" />
                <a
                  href={update.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {update.linkUrl}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Meta label="Type">
                <Badge variant="outline">{update.updateType}</Badge>
              </Meta>
              <Meta label="Importance">
                <Badge variant="secondary">{update.importance}</Badge>
              </Meta>
              <Meta label="Created">
                {format(update.createdAt, "PP")}
              </Meta>
            </CardContent>
          </Card>

          <Card className="glow-accent border-accent/30 relative overflow-hidden">
            <div className="blob bg-accent top-[-2rem] right-0 h-32 w-32 opacity-40" />
            <CardContent className="relative space-y-3 text-center">
              <span className="bg-gradient-accent mx-auto flex size-12 items-center justify-center rounded-2xl shadow-md">
                <Sparkles className="size-6 text-accent-foreground" />
              </span>
              <p className="font-display text-base font-semibold">
                Generate founder posts
              </p>
              <p className="text-muted-foreground text-xs">
                Turn these notes into 5 scored variations.
              </p>
              <GenerateButton updateId={update.id} reached={usage.reached} />
              <p className="text-muted-foreground text-xs">
                {usage.remaining} of {usage.limit} runs left this month.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated posts */}
      {posts.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight">
              Generated posts
            </h2>
            <Badge variant="secondary">{posts.length}</Badge>
          </div>
          <div className="grid gap-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p as unknown as PostView} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span>{children}</span>
    </div>
  );
}
