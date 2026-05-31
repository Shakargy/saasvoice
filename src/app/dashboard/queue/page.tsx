import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Queue" };

export default function QueuePage() {
  return (
    <>
      <PageHeader
        title="Content queue"
        description="Approved posts lined up with a planned date."
      />
      <EmptyState
        icon={CalendarClock}
        title="Your queue is empty"
        description="Approve a generated post and set a planned date to see it here. Scheduling lands alongside post management."
      />
    </>
  );
}
