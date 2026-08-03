import { Skeleton } from "@/components/ui/skeleton";

export default function ShareOutPreviewLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Skeleton className="h-8 w-2/3 rounded-full bg-muted" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
        <Skeleton className="h-20 rounded-2xl bg-muted" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
      <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
    </div>
  );
}
