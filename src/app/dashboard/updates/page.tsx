import Link from "next/link";
import type { Metadata } from "next";
import { formatDistanceToNow } from "date-fns";
import { FileText, Package, Plus, ArrowRight } from "lucide-react";

import { auth } from "@/lib/auth";
import { getProductProfile, getProductUpdates } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UpdateDialog } from "@/components/dashboard/update-dialog";
import { GithubImportDialog } from "@/components/dashboard/github-import-dialog";

export const metadata: Metadata = { title: "Updates" };

const importanceVariant = {
  low: "outline",
  medium: "secondary",
  high: "warning",
} as const;

export default async function UpdatesPage() {
  const session = await auth();
  const userId = session!.user.id;
  const profile = await getProductProfile(userId);

  if (!profile) {
    return (
      <>
        <PageHeader title="Product updates" />
        <EmptyState
          icon={Package}
          title="Create a product profile first"
          description="Updates attach to your product, so we need that set up before you add one."
          action={
            <Button asChild>
              <Link href="/dashboard/product/new">
                <Plus /> Create product profile
              </Link>
            </Button>
          }
        />
      </>
    );
  }

  const updates = await getProductUpdates(userId);

  return (
    <>
      <PageHeader
        title="Product updates"
        description="Raw notes you can turn into posts."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <GithubImportDialog />
            <UpdateDialog />
          </div>
        }
      />

      {updates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No updates yet"
          description="Add one manually, or import a commit straight from a public GitHub repo."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <GithubImportDialog />
              <UpdateDialog />
            </div>
          }
        />
      ) : (
        <div className="space-y-3">
          {updates.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`/dashboard/updates/${u.id}`}
                    className="block truncate font-medium hover:text-accent"
                  >
                    {u.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{u.updateType}</Badge>
                    <Badge variant={importanceVariant[u.importance as keyof typeof importanceVariant]}>
                      {u.importance}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(u.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="shrink-0 text-accent">
                  <Link href={`/dashboard/updates/${u.id}`}>
                    Open <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
