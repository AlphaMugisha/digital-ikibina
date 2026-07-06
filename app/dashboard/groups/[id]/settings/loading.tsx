import { Skeleton } from "@/components/ui/skeleton";

export default function GroupSettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-4 w-32 rounded-full bg-muted" />
      <Skeleton className="mt-4 h-8 w-48 rounded-full bg-muted" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-16 w-full rounded-xl bg-muted" />
        <Skeleton className="h-16 w-full rounded-xl bg-muted" />
        <Skeleton className="h-10 w-full rounded-xl bg-muted" />
        <Skeleton className="h-10 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}
