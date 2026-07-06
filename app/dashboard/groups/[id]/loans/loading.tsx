import { Skeleton } from "@/components/ui/skeleton";

export default function GroupLoansLoading() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
      </div>
      <div className="mt-8 space-y-3">
        <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
        <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
