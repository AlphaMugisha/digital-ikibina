import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-warm-sm lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card p-4 sm:p-5">
            <Skeleton className="h-3 w-24 rounded-full bg-muted" />
            <Skeleton className="mt-3 h-6 w-28 rounded-full bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-warm-sm">
        <div className="border-b border-border p-5 sm:p-6">
          <Skeleton className="h-5 w-48 rounded-full bg-muted" />
          <Skeleton className="mt-5 h-10 w-full max-w-md rounded-full bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 sm:px-6">
              <Skeleton className="h-4 w-40 rounded-full bg-muted" />
              <Skeleton className="h-4 w-24 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
