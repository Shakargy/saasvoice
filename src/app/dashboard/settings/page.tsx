import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { getUsageSummary } from "@/lib/usage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/dashboard/page-header";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  const usage = await getUsageSummary(session!.user.id);

  return (
    <>
      <PageHeader title="Settings" description="Your account and plan." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Name">{session!.user.name || "—"}</Row>
            <Separator />
            <Row label="Email">{session!.user.email}</Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Plan
              <Badge variant="secondary">Free</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Generation runs this month">
              {usage.used} / {usage.limit}
            </Row>
            <Separator />
            <Row label="Billing">
              <span className="text-muted-foreground">
                Paid plans aren&apos;t available yet.
              </span>
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session</CardTitle>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
