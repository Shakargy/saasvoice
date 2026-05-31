"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "approved", label: "Approved" },
  { key: "queued", label: "Queued" },
  { key: "archived", label: "Archived" },
];

export function PostsFilter({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t) => {
        const href = t.key === "all" ? "/dashboard/posts" : `/dashboard/posts?status=${t.key}`;
        const isActive = active === t.key;
        return (
          <Link
            key={t.key}
            href={href}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-accent/15 border-accent/40 text-accent font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
