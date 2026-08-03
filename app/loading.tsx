import { Logo } from "@/components/logo";

export default function RootLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background">
      <Logo href={null} />
      <span
        className="size-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
