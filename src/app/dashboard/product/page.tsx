import Link from "next/link";
import type { Metadata } from "next";
import { Package, Plus, Pencil } from "lucide-react";

import { auth } from "@/lib/auth";
import { getProductProfile } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Product" };

export default async function ProductPage() {
  const session = await auth();
  const profile = await getProductProfile(session!.user.id);

  if (!profile) {
    return (
      <>
        <PageHeader title="Product profile" />
        <EmptyState
          icon={Package}
          title="No product profile yet"
          description="Create one so SaaSVoice knows your product, audience, and tone."
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

  return (
    <>
      <PageHeader
        title="Product profile"
        description="This shapes the voice of every generated post."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/product/edit">
              <Pencil /> Edit
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {profile.productName}
            <Badge variant="secondary">{profile.category}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          {profile.websiteUrl && (
            <Detail label="Website">
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {profile.websiteUrl}
              </a>
            </Detail>
          )}
          <Detail label="Description">{profile.shortDescription}</Detail>
          <Detail label="Audience">{profile.targetAudience}</Detail>
          <div className="grid gap-5 sm:grid-cols-3">
            <Detail label="Tone">{profile.founderTone}</Detail>
            <Detail label="Default platform">{profile.defaultPlatform}</Detail>
            <Detail label="Post length">{profile.preferredPostLength}</Detail>
          </div>
          {profile.writingStyleNotes && (
            <Detail label="Writing notes">{profile.writingStyleNotes}</Detail>
          )}
          {profile.bannedWords && (
            <Detail label="Banned words">{profile.bannedWords}</Detail>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="text-foreground">{children}</p>
    </div>
  );
}
