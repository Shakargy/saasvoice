"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GitBranch, Search, Loader2, GitCommitHorizontal, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { apiFetch } from "@/lib/client";
import { guessUpdateType, type Commit } from "@/lib/github";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductUpdateForm } from "@/components/forms/product-update-form";
import type { ProductUpdateFormValues } from "@/lib/validators/product-update";

export function GithubImportDialog() {
  const [open, setOpen] = useState(false);
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [commits, setCommits] = useState<Commit[] | null>(null);
  const [picked, setPicked] = useState<ProductUpdateFormValues | null>(null);

  function reset() {
    setRepo("");
    setCommits(null);
    setPicked(null);
    setLoading(false);
  }

  async function lookup() {
    if (!repo.trim()) return;
    setLoading(true);
    setCommits(null);
    try {
      const { ok, data } = await apiFetch<{ commits: Commit[]; error?: string }>(
        `/api/github/commits?repo=${encodeURIComponent(repo.trim())}`
      );
      if (!ok || !data) {
        toast.error(data?.error ?? "Couldn't fetch commits.");
        return;
      }
      if (data.commits.length === 0) {
        toast.message("No commits found on that repo.");
      }
      setCommits(data.commits);
    } finally {
      setLoading(false);
    }
  }

  function pick(commit: Commit) {
    const body =
      commit.message.split("\n").slice(1).join("\n").trim() || commit.message;
    setPicked({
      title: commit.title,
      updateType: guessUpdateType(commit.message),
      rawNotes:
        body === commit.title
          ? `${commit.title}\n\n(commit ${commit.shortSha})`
          : `${body}\n\n(commit ${commit.shortSha})`,
      importance: "medium",
      includeLink: false,
      linkUrl: "",
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <GitBranch /> Import from GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {picked ? "Review & save update" : "Import from GitHub"}
          </DialogTitle>
          <DialogDescription>
            {picked
              ? "We prefilled this from the commit. Tweak it, then save."
              : "Paste a public repo. We'll pull recent commits — no login needed."}
          </DialogDescription>
        </DialogHeader>

        {picked ? (
          <div className="space-y-4">
            <button
              onClick={() => setPicked(null)}
              className="text-muted-foreground flex items-center gap-1 text-sm hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Back to commits
            </button>
            <ProductUpdateForm
              initial={{ ...picked, id: "" }}
              embedded
              onDone={() => {
                setOpen(false);
                reset();
              }}
              createMode
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="github.com/owner/repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    lookup();
                  }
                }}
              />
              <Button onClick={lookup} disabled={loading || !repo.trim()}>
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                Fetch
              </Button>
            </div>

            {commits && commits.length > 0 && (
              <ul className="space-y-2">
                {commits.map((c) => (
                  <li key={c.sha}>
                    <button
                      onClick={() => pick(c)}
                      className="card-hover hover:border-accent/40 flex w-full items-start gap-3 rounded-xl border p-3 text-left"
                    >
                      <GitCommitHorizontal className="text-accent mt-0.5 size-4 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {c.title}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {c.shortSha}
                          {c.author ? ` · ${c.author}` : ""}
                          {c.date
                            ? ` · ${formatDistanceToNow(new Date(c.date), { addSuffix: true })}`
                            : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {commits && commits.length === 0 && (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No commits found.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
