import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Zap,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getProductProfile } from "@/lib/queries";
import { getUsageSummary } from "@/lib/usage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function DashboardOverview() {
  const session = await auth();
  const userId = session!.user.id;

  const profile = await getProductProfile(userId);
  // New users go through onboarding instead of a bare dashboard.
  if (!profile) redirect("/dashboard/onboarding");

  const [usage, postCounts, recentUpdates] = await Promise.all([
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
  const firstName = session?.user.name?.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Hero / quick actions */}
      <Card className="glow-accent border-accent/20 relative overflow-hidden">
        <div className="blob bg-accent right-0 top-[-3rem] h-44 w-44 opacity-40" />
        <CardContent className="relative flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-accent text-sm font-medium">
              {profile.productName}
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {firstName ? `Hey ${firstName} 👋` : "Welcome back 👋"}
            </h1>
            <p className="text-muted-foreground text-sm">
              What did you ship? Turn it into founder-style posts.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard/updates">
                <Plus /> New update
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard/updates">
                <Sparkles /> Generate
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Sparkles} label="Generated" value={usage.used} accent />
        <StatCard icon={FileText} label="Drafts" value={drafts} />
        <StatCard icon={CheckCircle2} label="Approved" value={approved} />
        <StatCard icon={CalendarClock} label="Queued" value={queued} />
      </div>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Zap className="size-4 text-accent" /> Monthly usage
            </span>
            <span className="text-muted-foreground text-sm font-normal">
              {usage.used} / {usage.limit} runs
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={usedPct} />
          <p className="text-muted-foreground text-xs">
            {usage.remaining} generation runs left this month. Each run counts as
            one, no matter how many variations it makes.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Product summary */}
        <Card className="card-hover">
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
              <Badge>{profile.founderTone}</Badge>
              <Badge variant="outline">{profile.defaultPlatform}</Badge>
              <Badge variant="outline">{profile.preferredPostLength}</Badge>
            </div>
            <Button asChild variant="link" size="sm" className="px-0">
              <Link href="/dashboard/product">
                Edit profile <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent updates */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-base">Recent updates</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUpdates.length === 0 ? (
              <div className="text-muted-foreground space-y-3 py-2 text-sm">
                <p>No updates yet. Add your first one to start generating.</p>
                <Button asChild size="sm">
                  <Link href="/dashboard/updates">
                    <Plus /> Add update
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y">
                {recentUpdates.map((u) => (
                  <li key={u.id} className="py-2 first:pt-0 last:pb-0">
                    <Link
                      href={`/dashboard/updates/${u.id}`}
                      className="flex items-center justify-between gap-3 text-sm transition-colors hover:text-accent"
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
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="flex flex-col gap-2 py-4">
        <span
          className={
            accent
              ? "bg-gradient-accent flex size-9 items-center justify-center rounded-xl"
              : "bg-muted flex size-9 items-center justify-center rounded-xl"
          }
        >
          <Icon className={accent ? "size-4.5 text-accent-foreground" : "size-4.5 text-accent"} />
        </span>
        <div>
          <p className="font-display text-2xl font-bold leading-none">{value}</p>
          <p className="text-muted-foreground mt-1 text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
