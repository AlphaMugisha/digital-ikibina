import { Skeleton } from "@/components/ui/skeleton";

export default function GroupChatLoading() {
  return (
    <div className="mb-24 md:mb-0">
      <Skeleton className="h-[60vh] w-full rounded-2xl bg-muted" />
      <Skeleton className="mt-3 h-12 w-full rounded-full bg-muted" />
    </div>
  );
}
