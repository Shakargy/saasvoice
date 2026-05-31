import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-dashed bg-card/40 p-10 text-center",
        className
      )}
    >
      <div className="blob bg-accent top-[-2rem] left-1/2 h-32 w-32 -translate-x-1/2 opacity-30" />
      {Icon && (
        <span className="bg-accent/12 relative flex size-14 items-center justify-center rounded-2xl">
          <Icon className="text-accent size-7" />
        </span>
      )}
      <div className="relative space-y-1">
        <p className="font-display text-lg font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-sm text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="relative">{action}</div>}
    </div>
  );
}
