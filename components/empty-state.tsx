import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{subtitle}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
