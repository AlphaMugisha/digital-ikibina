import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
  return (
    <div>
      <div className="flex justify-end">
        <Skeleton className="h-11 w-36 rounded-full bg-muted" />
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl bg-muted" />
        <Skeleton className="h-20 w-full rounded-2xl bg-muted" />
        <Skeleton className="h-20 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
