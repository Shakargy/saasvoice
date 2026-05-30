import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Sparkles className="size-4 text-accent" />
          SaaSVoice
        </div>
        <p>Turn product updates into founder-style posts that sound human.</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-foreground">Sign in</Link>
          <Link href="/register" className="hover:text-foreground">Start free</Link>
          <a
            href="https://github.com/Shakargy/saasvoice"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
