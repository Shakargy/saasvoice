import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Brand } from "@/components/brand";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { BottomTabs } from "@/components/dashboard/bottom-tabs";
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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/70 px-4 backdrop-blur-xl">
        <Brand size="sm" href="/dashboard" />
        <UserMenu name={session.user.name} email={session.user.email} />
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-6 md:py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <div className="sticky top-24">
            <SidebarNav />
          </div>
        </aside>
        {/* pb gives room for the mobile bottom tab bar */}
        <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
      </div>

      <BottomTabs />
    </div>
  );
}
