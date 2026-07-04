import { Skeleton } from "@/components/ui/skeleton";

export default function GroupOverviewLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl bg-muted" />
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-xl bg-muted" />
        <Skeleton className="h-12 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}
