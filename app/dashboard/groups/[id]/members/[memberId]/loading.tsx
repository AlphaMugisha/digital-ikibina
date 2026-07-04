import { Skeleton } from "@/components/ui/skeleton";

export default function MemberDetailLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-40 rounded-full bg-muted" />
      <div className="mt-4 flex items-center gap-4">
        <Skeleton className="size-14 rounded-full bg-muted" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded-full bg-muted" />
          <Skeleton className="h-4 w-24 rounded-full bg-muted" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-2xl bg-muted" />
        <Skeleton className="h-16 rounded-2xl bg-muted" />
        <Skeleton className="h-16 rounded-2xl bg-muted" />
      </div>
      <div className="mt-6 space-y-2">
        <Skeleton className="h-12 w-full rounded-xl bg-muted" />
        <Skeleton className="h-12 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}
