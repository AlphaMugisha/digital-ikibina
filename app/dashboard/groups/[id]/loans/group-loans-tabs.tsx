"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { HandCoins } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LoanStatus } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";
import { LoanProgressBar } from "@/components/loans/loan-progress-bar";
import { PendingLoanActions } from "./pending/pending-loan-actions";

export type GroupLoanRow = {
  id: string;
  membershipId: string;
  isMine: boolean;
  name: string;
  purpose: string | null;
  amountLabel: string;
  status: LoanStatus;
  isOverdue: boolean;
  daysOverdue: number;
  requestedOn?: string;
  dueDateLabel?: string;
  progressRatio?: number;
  feesAccruedLabel?: string;
};

function LoanCard({ groupId, row, isLeader }: { groupId: string; row: GroupLoanRow; isLeader: boolean }) {
  const t = useTranslations("loans");

  const body = (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-warm-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display font-semibold text-foreground">{row.name}</p>
          {row.purpose && <p className="truncate text-xs text-muted-foreground">{row.purpose}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="font-display text-lg font-semibold text-primary">{row.amountLabel}</p>
          <LoanStatusBadge status={row.status} />
        </div>
      </div>
      {row.isOverdue && (
        <p className="mt-2 text-xs font-semibold text-destructive">
          {t("daysOverdueLabel", { days: row.daysOverdue })}
          {row.feesAccruedLabel ? ` · ${t("lateFeesLabel", { amount: row.feesAccruedLabel })}` : ""}
        </p>
      )}
      {row.progressRatio !== undefined && (
        <div className="mt-3">
          <LoanProgressBar ratio={row.progressRatio} />
        </div>
      )}
      {row.status === "PENDING" && isLeader && (
        <div className="mt-3">
          <PendingLoanActions loanId={row.id} />
        </div>
      )}
    </div>
  );

  if (row.status === "PENDING" && isLeader) {
    return <div>{body}</div>;
  }

  return (
    <Link href={`/dashboard/groups/${groupId}/loans/${row.id}`} className="block">
      {body}
    </Link>
  );
}

export function GroupLoansTabs({
  groupId,
  isLeader,
  pendingRows,
  activeRows,
  paidRows,
  overdueCount,
}: {
  groupId: string;
  isLeader: boolean;
  pendingRows: GroupLoanRow[];
  activeRows: GroupLoanRow[];
  paidRows: GroupLoanRow[];
  overdueCount: number;
}) {
  const t = useTranslations("loans");
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("filter") === "overdue" ? "overdue" : "group";

  const allRows = useMemo(() => [...pendingRows, ...activeRows, ...paidRows], [pendingRows, activeRows, paidRows]);
  const mineRows = useMemo(() => allRows.filter((r) => r.isMine), [allRows]);
  const overdueRows = useMemo(() => activeRows.filter((r) => r.isOverdue), [activeRows]);

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="mine" className="flex-1 sm:flex-none">
          {t("subTabMine")}
        </TabsTrigger>
        <TabsTrigger value="group" className="flex-1 sm:flex-none">
          {t("subTabGroup")}
        </TabsTrigger>
        <TabsTrigger value="overdue" className="flex-1 gap-1.5 sm:flex-none">
          {t("subTabOverdue")}
          {overdueCount > 0 && (
            <Badge className="rounded-full bg-destructive px-1.5 text-destructive-foreground">
              {overdueCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mine" className="mt-4 space-y-3">
        {mineRows.length === 0 ? (
          <EmptyState icon={HandCoins} title={t("noActiveLoans")} subtitle="" />
        ) : (
          mineRows.map((row) => <LoanCard key={row.id} groupId={groupId} row={row} isLeader={isLeader} />)
        )}
      </TabsContent>

      <TabsContent value="group" className="mt-4 space-y-3">
        {allRows.length === 0 ? (
          <EmptyState icon={HandCoins} title={t("noActiveLoans")} subtitle="" />
        ) : (
          allRows.map((row) => <LoanCard key={row.id} groupId={groupId} row={row} isLeader={isLeader} />)
        )}
      </TabsContent>

      <TabsContent value="overdue" className="mt-4 space-y-3">
        {overdueRows.length === 0 ? (
          <EmptyState icon={HandCoins} title={t("noOverdueLoans")} subtitle="" />
        ) : (
          overdueRows.map((row) => <LoanCard key={row.id} groupId={groupId} row={row} isLeader={isLeader} />)
        )}
      </TabsContent>
    </Tabs>
  );
}
