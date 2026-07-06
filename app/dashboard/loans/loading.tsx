import { Skeleton } from "@/components/ui/skeleton";

export default function MyLoansLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-8 w-40 rounded-full bg-muted" />
      <Skeleton className="mt-4 h-9 w-full max-w-sm rounded-lg bg-muted" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl bg-muted" />
        <Skeleton className="h-20 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
