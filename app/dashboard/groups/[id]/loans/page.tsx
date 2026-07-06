import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus, HandCoins } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { calculateAmountOwed, calculateGroupLendingCapacity } from "@/lib/loans";
import { calculateGroupSummary } from "@/lib/balances";
import { getGroupWithMembership } from "@/lib/groups";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";
import { LoanProgressBar } from "@/components/loans/loan-progress-bar";
import { PendingLoanActions } from "./pending/pending-loan-actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans");
  return { title: `${t("title")} — Digital Ibimina` };
}

export default async function GroupLoansPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  const isLeader = membership.role === "LEADER";

  const [locale, t, summary, totalLentOutAgg, pendingLoans, activeLoans, paidLoans] =
    await Promise.all([
      getLocale(),
      getTranslations("loans"),
      calculateGroupSummary(groupId),
      prisma.loan.aggregate({
        where: { membership: { groupId }, status: { in: ["ACTIVE", "PAID"] } },
        _sum: { amount: true },
      }),
      prisma.loan.findMany({
        where: { membership: { groupId }, status: "PENDING" },
        include: { membership: { include: { user: { select: { name: true } } } } },
        orderBy: { requestedAt: "asc" },
      }),
      prisma.loan.findMany({
        where: { membership: { groupId }, status: "ACTIVE" },
        include: {
          membership: { include: { user: { select: { name: true } } } },
          payments: true,
        },
      }),
      prisma.loan.findMany({
        where: {
          membership: { groupId },
          status: "PAID",
          takenAt: { gte: group.cycleStart, lte: group.cycleEnd },
        },
        include: { membership: { include: { user: { select: { name: true } } } }, payments: true },
      }),
    ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const totalLentOut = totalLentOutAgg._sum.amount ?? 0;
  const availableToLend = calculateGroupLendingCapacity(summary);
  const interestEarned = paidLoans.reduce((sum, loan) => {
    const totalPaid = loan.payments.reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, totalPaid - loan.amount);
  }, 0);

  const now = new Date();
  const activeWithOwed = activeLoans
    .map((loan) => {
      const owed = calculateAmountOwed(loan, loan.payments, now);
      const originalTotal = loan.amount + owed.interestAccrued;
      const progressRatio = originalTotal > 0 ? 1 - owed.totalOwed / originalTotal : 0;
      const isOverdue = loan.dueDate.getTime() < now.getTime();
      return { loan, owed, progressRatio, isOverdue };
    })
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      return a.loan.dueDate.getTime() - b.loan.dueDate.getTime();
    });

  const recentlyPaid = paidLoans
    .map((loan) => {
      const lastPaidAt = loan.payments.reduce(
        (latest, p) => (p.paidAt.getTime() > latest.getTime() ? p.paidAt : latest),
        new Date(0),
      );
      return { loan, lastPaidAt };
    })
    .sort((a, b) => b.lastPaidAt.getTime() - a.lastPaidAt.getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("totalLentOut")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
            {formatRWF(totalLentOut, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-accent/10 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("currentlyOutstanding")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-accent-foreground">
            {formatRWF(summary.totalLoansOut, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("interestEarned")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
            {formatRWF(interestEarned, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("availableToLend")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
            {formatRWF(availableToLend, locale)}
          </p>
        </div>
      </div>

      {pendingLoans.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("pendingRequestsTitle")}
          </h2>
          <div className="mt-3 space-y-3">
            {pendingLoans.map((loan) => (
              <div
                key={loan.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-warm-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-foreground">
                      {loan.membership.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{loan.purpose}</p>
                  </div>
                  <p className="shrink-0 font-display text-lg font-semibold text-primary">
                    {formatRWF(loan.amount, locale)}
                  </p>
                </div>
                {isLeader ? (
                  <div className="mt-3">
                    <PendingLoanActions loanId={loan.id} />
                  </div>
                ) : (
                  <div className="mt-2">
                    <LoanStatusBadge status={loan.status} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeWithOwed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("activeLoansTitle")}
          </h2>
          <div className="mt-3 space-y-3">
            {activeWithOwed.map(({ loan, owed, progressRatio, isOverdue }) => (
              <Link
                key={loan.id}
                href={`/dashboard/groups/${groupId}/loans/${loan.id}`}
                className="block rounded-2xl border border-border bg-card p-4 shadow-warm-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-foreground">
                      {loan.membership.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("dueDateLabel")}: {dateFormatter.format(loan.dueDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isOverdue && (
                      <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                        {t("overdue")}
                      </span>
                    )}
                    <p className="font-display text-lg font-semibold text-foreground">
                      {formatRWF(owed.totalOwed, locale)}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <LoanProgressBar ratio={progressRatio} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentlyPaid.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("recentlyPaid")}
          </h2>
          <div className="mt-3 space-y-2">
            {recentlyPaid.map(({ loan }) => (
              <Link
                key={loan.id}
                href={`/dashboard/groups/${groupId}/loans/${loan.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">
                  {loan.membership.user.name}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {formatRWF(loan.amount, locale)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pendingLoans.length === 0 && activeWithOwed.length === 0 && recentlyPaid.length === 0 && (
        <div className="mt-4">
          <EmptyState icon={HandCoins} title={t("noActiveLoans")} subtitle="" />
        </div>
      )}

      {/* Desktop: regular button; mobile uses the floating button below */}
      <div className="mt-8 hidden justify-end md:flex">
        <Button asChild className="h-11 rounded-full">
          <Link href={`/dashboard/groups/${groupId}/loans/new`}>
            <Plus className="size-5" aria-hidden="true" />
            {t("requestLoan")}
          </Link>
        </Button>
      </div>

      {/* Mobile floating action button, above the floating bottom nav */}
      <Button
        asChild
        size="icon"
        aria-label={t("requestLoan")}
        className="fixed bottom-24 right-4 z-30 size-14 rounded-full shadow-warm-lg md:hidden"
      >
        <Link href={`/dashboard/groups/${groupId}/loans/new`}>
          <Plus className="size-6" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
