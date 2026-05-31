import type { Metadata } from "next";
import { AtSign, Briefcase } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = { title: "Integrations" };

const integrations = [
  {
    icon: AtSign,
    name: "X (Twitter)",
    description:
      "Post directly to X from SaaSVoice. Planned as a premium feature — platform APIs cost money, so this comes later.",
  },
  {
    icon: Briefcase,
    name: "LinkedIn",
    description:
      "Publish founder posts straight to LinkedIn. Also planned for a future premium tier.",
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Direct posting is coming later. Copy and CSV export work today."
      />

      <Card className="mb-6 border-accent/30 bg-accent/5">
        <CardContent className="text-sm text-muted-foreground">
          SaaSVoice focuses on writing better posts, not scheduling. You can copy
          any post or export to CSV right now. Direct platform posting will be a
          premium add-on because the platform APIs are paid.
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((i) => (
          <Card key={i.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <i.icon className="size-5 text-accent" />
                  {i.name}
                </span>
                <Badge variant="secondary">Coming later</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {i.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
