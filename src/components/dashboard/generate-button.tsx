"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

import { apiSend } from "@/lib/client";
import { Button } from "@/components/ui/button";

export function GenerateButton({
  updateId,
  reached,
}: {
  updateId: string;
  reached: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const { ok, status, data } = await apiSend<{ error?: string }>(
        `/api/updates/${updateId}/generate`,
        "POST"
      );
      if (!ok) {
        if (status === 402) {
          toast.error(data?.error ?? "Monthly limit reached.");
        } else {
          toast.error(data?.error ?? "Generation failed. Try again.");
        }
        return;
      }
      toast.success("Generated 5 posts");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (reached) {
    return (
      <Button className="w-full" disabled>
        Monthly limit reached
      </Button>
    );
  }

  return (
    <Button className="w-full" onClick={generate} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
      {loading ? "Generating…" : "Generate posts"}
    </Button>
  );
}
