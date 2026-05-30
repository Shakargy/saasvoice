import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-semibold tracking-tight"
      >
        <Sparkles className="size-5 text-accent" />
        SaaSVoice
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
