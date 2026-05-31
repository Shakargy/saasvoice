"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Pencil,
  CircleCheck,
  CalendarClock,
  Archive,
  Loader2,
  AlertTriangle,
  Save,
  X,
} from "lucide-react";

import { apiSend } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScoreBadge } from "./score-badge";
import { cn } from "@/lib/utils";

export type PostView = {
  id: string;
  variantName: string;
  platform: string;
  text: string;
  hook: string;
  hashtags: unknown;
  estimatedCharacters: number;
  aiGenericScore: number;
  humanScore: number;
  reasoning: string;
  warnings: unknown;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  approved: "Approved",
  queued: "Queued",
  posted_manually: "Posted",
  archived: "Archived",
};

export function PostCard({ post }: { post: PostView }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(post.text);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const warnings = Array.isArray(post.warnings)
    ? (post.warnings as string[])
    : [];
  const isX = post.platform === "X";
  const overLimit = isX && text.length > 280;

  async function act(
    action: "approve" | "archive" | "queue",
    label: string
  ) {
    setBusy(action);
    try {
      const { ok, data } = await apiSend<{ error?: string }>(
        `/api/posts/${post.id}/${action}`,
        "POST"
      );
      if (!ok) {
        toast.error(data?.error ?? "Something went wrong.");
        return;
      }
      toast.success(label);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      // Best-effort: record the copy (don't block the UX on it).
      apiSend(`/api/posts/${post.id}/copy`, "POST");
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't access the clipboard.");
    }
  }

  async function save() {
    setBusy("save");
    try {
      const { ok, data } = await apiSend<{ error?: string }>(
        `/api/posts/${post.id}`,
        "PATCH",
        { text }
      );
      if (!ok) {
        toast.error(data?.error ?? "Couldn't save.");
        return;
      }
      toast.success("Saved");
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="card-hover">
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{post.variantName}</Badge>
            <Badge variant="outline">{post.platform}</Badge>
            {post.status !== "draft" && (
              <Badge>{STATUS_LABEL[post.status] ?? post.status}</Badge>
            )}
          </div>
          <ScoreBadge
            humanScore={post.humanScore}
            aiGenericScore={post.aiGenericScore}
          />
        </div>

        {editing ? (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="text-sm"
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{text}</p>
        )}

        <div className="flex items-center justify-between text-xs">
          <span
            className={cn(
              "text-muted-foreground",
              overLimit && "text-destructive font-medium"
            )}
          >
            {text.length} chars{isX ? " / 280" : ""}
          </span>
        </div>

        {/* Why-it-may-sound-generic */}
        <div className="bg-muted/40 rounded-lg p-3 text-xs">
          <p className="text-muted-foreground">{post.reasoning}</p>
          {warnings.length > 0 && (
            <ul className="mt-2 space-y-1">
              {warnings.slice(0, 4).map((w, i) => (
                <li key={i} className="flex items-start gap-1.5 text-warning">
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          {editing ? (
            <>
              <Button size="sm" onClick={save} disabled={busy === "save" || overLimit}>
                {busy === "save" ? <Loader2 className="animate-spin" /> : <Save />}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setText(post.text);
                  setEditing(false);
                }}
              >
                <X /> Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={copy}>
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                <Pencil /> Edit
              </Button>
              {post.status !== "approved" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => act("approve", "Approved")}
                  disabled={busy === "approve"}
                >
                  {busy === "approve" ? <Loader2 className="animate-spin" /> : <CircleCheck />}
                  Approve
                </Button>
              )}
              {post.status !== "queued" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => act("queue", "Added to queue")}
                  disabled={busy === "queue"}
                >
                  {busy === "queue" ? <Loader2 className="animate-spin" /> : <CalendarClock />}
                  Queue
                </Button>
              )}
              {post.status !== "archived" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => act("archive", "Archived")}
                  disabled={busy === "archive"}
                >
                  {busy === "archive" ? <Loader2 className="animate-spin" /> : <Archive />}
                  Archive
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
