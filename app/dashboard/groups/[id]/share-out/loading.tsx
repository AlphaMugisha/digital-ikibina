import { Skeleton } from "@/components/ui/skeleton";

export default function ShareOutTabLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl bg-muted" />
      <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
    </div>
  );
}
