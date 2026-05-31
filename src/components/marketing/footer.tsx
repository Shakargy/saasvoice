import Link from "next/link";

import { Brand } from "@/components/brand";

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Brand />
          <p className="text-sm text-muted-foreground">
            Turn product updates into founder-style posts that sound human.
          </p>
        </div>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
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
