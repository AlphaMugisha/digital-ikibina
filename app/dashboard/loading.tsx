import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
      </div>
      <Skeleton className="mt-8 h-4 w-40 rounded-full bg-muted" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
        <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
