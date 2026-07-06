import { Skeleton } from "@/components/ui/skeleton";

export default function LoanDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-4 w-40 rounded-full bg-muted" />
      <Skeleton className="mt-4 h-8 w-48 rounded-full bg-muted" />
      <Skeleton className="mt-6 h-2 w-full rounded-full bg-muted" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
      </div>
      <div className="mt-8 space-y-2">
        <Skeleton className="h-14 w-full rounded-xl bg-muted" />
        <Skeleton className="h-14 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}
