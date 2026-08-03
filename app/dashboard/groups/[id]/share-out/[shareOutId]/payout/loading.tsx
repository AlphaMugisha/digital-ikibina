import { Skeleton } from "@/components/ui/skeleton";

export default function PayoutLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Skeleton className="h-8 w-1/2 rounded-full bg-muted" />
      <Skeleton className="h-16 w-full rounded-xl bg-muted" />
      <Skeleton className="h-16 w-full rounded-xl bg-muted" />
      <Skeleton className="h-16 w-full rounded-xl bg-muted" />
    </div>
  );
}
