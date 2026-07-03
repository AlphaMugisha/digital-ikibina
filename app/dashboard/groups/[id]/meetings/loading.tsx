import { Skeleton } from "@/components/ui/skeleton";

export default function MeetingsLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-4 w-48 rounded-full bg-muted" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-8 w-32 rounded-full bg-muted" />
        <Skeleton className="h-11 w-40 rounded-full bg-muted" />
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl bg-muted" />
        <Skeleton className="h-20 w-full rounded-2xl bg-muted" />
        <Skeleton className="h-20 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
