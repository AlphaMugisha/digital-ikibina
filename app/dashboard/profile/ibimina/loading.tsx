import { Skeleton } from "@/components/ui/skeleton";

export default function IbiminaLoading() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-warm-sm">
      <div className="border-b border-border p-5 sm:p-6">
        <Skeleton className="h-5 w-40 rounded-full bg-muted" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full rounded-full bg-muted" />
      </div>
      <div className="divide-y divide-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="px-5 py-4 sm:px-6">
            <Skeleton className="h-4 w-44 rounded-full bg-muted" />
            <Skeleton className="mt-2 h-3 w-60 max-w-full rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
