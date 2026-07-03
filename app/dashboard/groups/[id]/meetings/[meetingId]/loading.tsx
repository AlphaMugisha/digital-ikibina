import { Skeleton } from "@/components/ui/skeleton";

export default function MeetingRecordingLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-4 w-56 rounded-full bg-muted" />
      <Skeleton className="mt-4 h-8 w-48 rounded-full bg-muted" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
