import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { auth } from "@/lib/auth";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { UserMenu } from "@/components/dashboard/user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Proxy already guards this, but double-check on the server for safety.
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <Sparkles className="size-5 text-accent" />
            SaaSVoice
          </Link>
        </div>
        <UserMenu name={session.user.name} email={session.user.email} />
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <div className="sticky top-24">
            <SidebarNav />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
