import Link from "next/link";
import {
  Package,
  FileText,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  Plus,
  ArrowRight,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getProductProfile } from "@/lib/queries";
import { getUsageSummary } from "@/lib/usage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export default async function DashboardOverview() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, usage, postCounts, recentUpdates] = await Promise.all([
    getProductProfile(userId),
    getUsageSummary(userId),
    prisma.generatedPost.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.productUpdate.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const countByStatus = (status: string) =>
    postCounts.find((c) => c.status === status)?._count._all ?? 0;

  const drafts = countByStatus("draft");
  const approved = countByStatus("approved");
  const queued = countByStatus("queued");
  const usedPct = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  if (!profile) {
    return (
      <>
        <PageHeader
          title="Welcome to SaaSVoice"
          description="Set up your product so generated posts sound like you."
        />
        <EmptyState
          icon={Package}
          title="Create your product profile"
          description="Tell SaaSVoice what you're building, who it's for, and your founder tone. This shapes every post."
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
        title={`Hello${session?.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}`}
        description="Your founder content workspace."
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/updates">
                <Plus /> New update
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/updates">
                <Sparkles /> Generate posts
              </Link>
            </Button>
          </div>
        }
      />

      {/* Usage meter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            Monthly usage
            <span className="text-muted-foreground text-sm font-normal">
              {usage.used} / {usage.limit} generation runs
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={usedPct} />
          <p className="text-muted-foreground text-xs">
            {usage.remaining} runs left this month. Each generation run counts as
            one, no matter how many variations it produces.
          </p>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Drafts" value={drafts} />
        <StatCard icon={CheckCircle2} label="Approved" value={approved} />
        <StatCard icon={CalendarClock} label="Queued" value={queued} />
        <StatCard
          icon={Sparkles}
          label="Generated this month"
          value={usage.used}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product profile summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              {profile.productName}
              <Badge variant="secondary">{profile.category}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground line-clamp-2">
              {profile.shortDescription}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{profile.founderTone}</Badge>
              <Badge variant="outline">{profile.defaultPlatform}</Badge>
              <Badge variant="outline">{profile.preferredPostLength}</Badge>
            </div>
            <Button asChild variant="ghost" size="sm" className="px-0 text-accent">
              <Link href="/dashboard/product">
                Edit profile <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent updates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent updates</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUpdates.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No updates yet. Add your first one to start generating posts.
              </p>
            ) : (
              <ul className="divide-y">
                {recentUpdates.map((u) => (
                  <li key={u.id} className="py-2 first:pt-0 last:pb-0">
                    <Link
                      href={`/dashboard/updates/${u.id}`}
                      className="flex items-center justify-between gap-3 text-sm hover:text-accent"
                    >
                      <span className="truncate">{u.title}</span>
                      <Badge variant="outline" className="shrink-0">
                        {u.updateType}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="bg-muted flex size-10 items-center justify-center rounded-md">
          <Icon className="text-accent size-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-muted-foreground text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
