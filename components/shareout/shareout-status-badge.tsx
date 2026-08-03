import { useTranslations } from "next-intl";
import type { AllocationStatus, ShareOutStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ShareOutStatus, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  FINALIZED: "bg-accent/20 text-accent-foreground",
  COMPLETED: "bg-primary/10 text-primary",
  CANCELLED: "bg-destructive/10 text-destructive",
};

const STATUS_KEY: Record<ShareOutStatus, string> = {
  DRAFT: "statusDraft",
  FINALIZED: "statusFinalized",
  COMPLETED: "statusCompleted",
  CANCELLED: "statusCancelled",
};

export function ShareOutStatusBadge({ status }: { status: ShareOutStatus }) {
  const t = useTranslations("shareout");
  return (
    <Badge variant="outline" className={cn("rounded-full border-none font-semibold", STATUS_STYLES[status])}>
      {t(STATUS_KEY[status] as "statusDraft")}
    </Badge>
  );
}

const ALLOCATION_STYLES: Record<AllocationStatus, string> = {
  PENDING: "bg-secondary text-muted-foreground",
  PAID: "bg-primary/10 text-primary",
  WAIVED: "bg-destructive/10 text-destructive",
};

const ALLOCATION_KEY: Record<AllocationStatus, string> = {
  PENDING: "allocationStatusPending",
  PAID: "allocationStatusPaid",
  WAIVED: "allocationStatusWaived",
};

export function AllocationStatusBadge({ status }: { status: AllocationStatus }) {
  const t = useTranslations("shareout");
  return (
    <Badge variant="outline" className={cn("rounded-full border-none font-semibold", ALLOCATION_STYLES[status])}>
      {t(ALLOCATION_KEY[status] as "allocationStatusPending")}
    </Badge>
  );
}
