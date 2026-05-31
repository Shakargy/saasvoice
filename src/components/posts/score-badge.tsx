import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shows the human score with a colour that reflects the anti-AI risk.
 * green = sounds human, amber = some risk, red = reads like AI.
 */
export function ScoreBadge({
  humanScore,
  aiGenericScore,
  className,
}: {
  humanScore: number;
  aiGenericScore: number;
  className?: string;
}) {
  const tone =
    aiGenericScore >= 60 ? "bad" : aiGenericScore >= 35 ? "warn" : "good";

  const config = {
    good: {
      icon: ShieldCheck,
      label: "Sounds human",
      classes: "bg-success/15 text-success",
    },
    warn: {
      icon: ShieldAlert,
      label: "Some AI risk",
      classes: "bg-warning/15 text-warning",
    },
    bad: {
      icon: ShieldX,
      label: "Reads like AI",
      classes: "bg-destructive/15 text-destructive",
    },
  }[tone];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        config.classes,
        className
      )}
    >
      <Icon className="size-3.5" />
      {humanScore}% human
      <span className="opacity-60">· {config.label}</span>
    </span>
  );
}
