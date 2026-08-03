import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { HandCoins } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { calculateAmountOwed, calculateGroupLendingCapacity } from "@/lib/loans";
import { calculateGroupSummary } from "@/lib/balances";
import { getGroupWithMembership } from "@/lib/groups";
import { GroupLoansTabs, type GroupLoanRow } from "./group-loans-tabs";

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

  const pendingRows: GroupLoanRow[] = pendingLoans.map((loan) => ({
    id: loan.id,
    membershipId: loan.membershipId,
    isMine: loan.membershipId === membership.id,
    name: loan.membership.user.name,
    purpose: loan.purpose,
    amountLabel: formatRWF(loan.amount, locale),
    status: loan.status,
    isOverdue: false,
    daysOverdue: 0,
    requestedOn: dateFormatter.format(loan.requestedAt),
  }));

  const activeRows: GroupLoanRow[] = activeLoans.map((loan) => {
    const owed = calculateAmountOwed(loan, loan.payments, now);
    const isOverdue = loan.dueDate.getTime() < now.getTime();
    const daysOverdue = isOverdue ? Math.floor((now.getTime() - loan.dueDate.getTime()) / 86_400_000) : 0;
    const originalTotal = loan.amount + owed.interestAccrued;
    const progressRatio = originalTotal > 0 ? 1 - owed.totalOwed / originalTotal : 0;
    return {
      id: loan.id,
      membershipId: loan.membershipId,
      isMine: loan.membershipId === membership.id,
      name: loan.membership.user.name,
      purpose: loan.purpose,
      amountLabel: formatRWF(owed.totalOwed, locale),
      status: loan.status,
      isOverdue,
      daysOverdue,
      dueDateLabel: dateFormatter.format(loan.dueDate),
      progressRatio,
      feesAccruedLabel: owed.feesRemaining > 0 ? formatRWF(owed.feesRemaining, locale) : undefined,
    };
  });

  const paidRows: GroupLoanRow[] = paidLoans.map((loan) => ({
    id: loan.id,
    membershipId: loan.membershipId,
    isMine: loan.membershipId === membership.id,
    name: loan.membership.user.name,
    purpose: loan.purpose,
    amountLabel: formatRWF(loan.amount, locale),
    status: loan.status,
    isOverdue: false,
    daysOverdue: 0,
  }));

  const overdueCount = activeRows.filter((r) => r.isOverdue).length;

  return (
    <div>
      <Link
        href={`/dashboard/groups/${groupId}/loans/new`}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-warm-sm hover:bg-primary/90"
      >
        <HandCoins className="size-5" aria-hidden="true" />
        {t("requestLoan")}
      </Link>

      <div className="mt-6 grid grid-cols-2 gap-3">
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

      <div className="mt-6">
        <GroupLoansTabs
          groupId={groupId}
          isLeader={isLeader}
          pendingRows={pendingRows}
          activeRows={activeRows}
          paidRows={paidRows}
          overdueCount={overdueCount}
        />
      </div>
    </div>
  );
}
