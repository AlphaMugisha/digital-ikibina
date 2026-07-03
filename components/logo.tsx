import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  mark = true,
}: {
  href?: string | null;
  className?: string;
  mark?: boolean;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {mark && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          DI
        </span>
      )}
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Digital Ibimina
      </span>
    </span>
  );

  if (href === null) return content;

  return (
    <Link href={href} className="shrink-0">
      {content}
    </Link>
  );
}
