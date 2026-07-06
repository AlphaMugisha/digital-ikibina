"use client";

import Link from "next/link";
import { ChevronRight, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LoanStatus } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";

export type MyLoanRow = {
  id: string;
  groupId: string;
  groupName: string;
  status: LoanStatus;
  amountLabel: string;
  dueDateLabel: string;
};

const TABS = [
  { value: "active", statuses: ["ACTIVE", "APPROVED", "DEFAULTED"] as LoanStatus[] },
  { value: "pending", statuses: ["PENDING"] as LoanStatus[] },
  { value: "paid", statuses: ["PAID"] as LoanStatus[] },
  { value: "rejected", statuses: ["REJECTED"] as LoanStatus[] },
] as const;

export function MyLoansTabs({ loans }: { loans: MyLoanRow[] }) {
  const t = useTranslations("loans");

  const tabLabel: Record<(typeof TABS)[number]["value"], string> = {
    active: t("tabActive"),
    pending: t("tabPending"),
    paid: t("tabPaid"),
    rejected: t("tabRejected"),
  };
  const emptyLabel: Record<(typeof TABS)[number]["value"], string> = {
    active: t("noActiveLoans"),
    pending: t("noPendingLoans"),
    paid: t("noPaidLoans"),
    rejected: t("noRejectedLoans"),
  };

  return (
    <Tabs defaultValue="active">
      <TabsList className="w-full sm:w-auto">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-1 sm:flex-none">
            {tabLabel[tab.value]}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => {
        const rows = loans.filter((l) => tab.statuses.includes(l.status));
        return (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {rows.length === 0 ? (
              <EmptyState icon={Wallet} title={emptyLabel[tab.value]} subtitle="" />
            ) : (
              <div className="space-y-3">
                {rows.map((loan) => (
                  <Link
                    key={loan.id}
                    href={`/dashboard/groups/${loan.groupId}/loans/${loan.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-warm-sm transition-all hover:-translate-y-0.5 hover:shadow-warm-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display font-semibold text-foreground">
                          {loan.amountLabel}
                        </p>
                        <LoanStatusBadge status={loan.status} />
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {loan.groupName}
                      </p>
                      <p className="text-xs text-muted-foreground">{loan.dueDateLabel}</p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
