import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSectionLoading() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-warm-sm">
      <div className="border-b border-border p-5 sm:p-6">
        <Skeleton className="h-5 w-48 rounded-full bg-muted" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full rounded-full bg-muted" />
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <Skeleton className="h-11 w-full max-w-sm rounded-xl bg-muted" />
        <Skeleton className="h-11 w-64 max-w-full rounded-full bg-muted" />
        <Skeleton className="h-11 w-32 rounded-full bg-muted" />
      </div>
    </div>
  );
}
