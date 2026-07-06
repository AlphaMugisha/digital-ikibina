import { Skeleton } from "@/components/ui/skeleton";

export default function NewLoanLoading() {
  return (
    <div className="mx-auto max-w-md">
      <Skeleton className="h-4 w-40 rounded-full bg-muted" />
      <Skeleton className="mt-4 h-8 w-48 rounded-full bg-muted" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
      </div>
      <Skeleton className="mt-6 h-80 w-full rounded-2xl bg-muted" />
    </div>
  );
}
