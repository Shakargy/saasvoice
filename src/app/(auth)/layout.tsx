import { Brand } from "@/components/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="blob bg-accent left-1/2 top-[-4rem] h-72 w-72 -translate-x-1/2" />
      <div className="blob bg-accent-2 bottom-[-4rem] right-10 h-56 w-56 opacity-40" />
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand href="/" size="lg" />
        </div>
        {children}
      </div>
    </div>
  );
}
