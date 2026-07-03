import { Skeleton } from "@/components/ui/skeleton";

export default function GroupsLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40 rounded-full bg-muted" />
        <Skeleton className="hidden h-11 w-44 rounded-full bg-muted md:block" />
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
        <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
        <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
