"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Triggers a CSV download. The endpoint sets a Content-Disposition header, so a
 * plain anchor navigation downloads the file without leaving the page.
 */
export function ExportButton() {
  return (
    <Button asChild variant="outline" size="sm">
      <a href="/api/posts/export" download>
        <Download /> Export CSV
      </a>
    </Button>
  );
}
