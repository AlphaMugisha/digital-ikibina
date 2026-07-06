import { cn } from "@/lib/utils";

/** `ratio` is 0-1 (paid vs. total owed at disbursement). Solid fill, no gradient. */
export function LoanProgressBar({ ratio, className }: { ratio: number; className?: string }) {
  const clamped = Math.min(1, Math.max(0, ratio));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
