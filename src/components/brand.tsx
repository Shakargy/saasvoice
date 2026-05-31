import Link from "next/link";
import { cn } from "@/lib/utils";

/** SaaSVoice wordmark with a soundwave glyph. */
export function Brand({
  className,
  href = "/",
  size = "md",
}: {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const text =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";

  const inner = (
    <span className={cn("flex items-center gap-2 font-display font-bold tracking-tight", text, className)}>
      <Waveform />
      <span>
        SaaS<span className="text-gradient">Voice</span>
      </span>
    </span>
  );

  if (href === null) return inner;
  return (
    <Link href={href} className="inline-flex">
      {inner}
    </Link>
  );
}

function Waveform() {
  return (
    <span className="bg-gradient-accent flex size-7 items-center justify-center rounded-lg shadow-sm">
      <svg
        viewBox="0 0 24 24"
        className="size-4 text-accent-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M3 12h0M7 8v8M11 4v16M15 7v10M19 10v4M21 12h0" />
      </svg>
    </span>
  );
}
