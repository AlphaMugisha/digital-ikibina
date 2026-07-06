import { useTranslations } from "next-intl";
import type { LoanStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<LoanStatus, string> = {
  PENDING: "bg-secondary text-muted-foreground",
  APPROVED: "bg-accent/20 text-accent-foreground",
  ACTIVE: "bg-primary/10 text-primary",
  PAID: "bg-primary/10 text-primary",
  REJECTED: "bg-destructive/10 text-destructive",
  DEFAULTED: "bg-destructive/10 text-destructive",
};

const STATUS_KEY: Record<LoanStatus, string> = {
  PENDING: "statusPending",
  APPROVED: "statusApproved",
  ACTIVE: "statusActive",
  PAID: "statusPaid",
  REJECTED: "statusRejected",
  DEFAULTED: "statusDefaulted",
};

/** Client component — used inside both server and client trees via next-intl's useTranslations. */
export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const t = useTranslations("loans");
  return (
    <Badge variant="outline" className={cn("rounded-full border-none font-semibold", STATUS_STYLES[status])}>
      {t(STATUS_KEY[status] as "statusPending")}
    </Badge>
  );
}
