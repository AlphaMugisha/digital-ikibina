import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Anything with the same query surface as the default client — the
 * singleton, or a `tx` inside `prisma.$transaction(async (tx) => ...)`. */
type Db = typeof prisma | Prisma.TransactionClient;

export type MemberBalance = {
  totalContributed: number;
  activeLoanAmount: number;
  netBalance: number;
};

/**
 * All figures in integer cents. Interest is tracked separately from principal.
 * Pass a transaction's `tx` client when calling from inside `$transaction`
 * (e.g. to re-check limits atomically before approving a loan).
 */
export async function calculateMemberBalance(
  membershipId: string,
  db: Db = prisma,
): Promise<MemberBalance> {
  const [contributions, activeLoans] = await Promise.all([
    db.contribution.aggregate({
      where: { membershipId },
      _sum: { amount: true },
    }),
    db.loan.aggregate({
      where: { membershipId, status: "ACTIVE" },
      _sum: { amount: true },
    }),
  ]);

  const totalContributed = contributions._sum.amount ?? 0;
  const activeLoanAmount = activeLoans._sum.amount ?? 0;

  return {
    totalContributed,
    activeLoanAmount,
    netBalance: totalContributed - activeLoanAmount,
  };
}

export type GroupSummary = {
  totalPool: number;
  totalContributions: number;
  totalLoansOut: number;
  totalLoansPaid: number;
  memberCount: number;
  meetingCount: number;
};

/**
 * Cash actually on hand for the group: contributions collected plus loan
 * repayments received, minus principal currently out on active loans.
 * Pass a transaction's `tx` client when calling from inside `$transaction`.
 */
export async function calculateGroupSummary(
  groupId: string,
  db: Db = prisma,
): Promise<GroupSummary> {
  const [
    contributions,
    loansOut,
    loanPayments,
    memberCount,
    meetingCount,
  ] = await Promise.all([
    db.contribution.aggregate({
      where: { membership: { groupId } },
      _sum: { amount: true },
    }),
    db.loan.aggregate({
      where: { membership: { groupId }, status: "ACTIVE" },
      _sum: { amount: true },
    }),
    db.loanPayment.aggregate({
      where: { loan: { membership: { groupId } } },
      _sum: { amount: true },
    }),
    db.membership.count({ where: { groupId } }),
    db.meeting.count({ where: { groupId } }),
  ]);

  const totalContributions = contributions._sum.amount ?? 0;
  const totalLoansOut = loansOut._sum.amount ?? 0;
  const totalLoansPaid = loanPayments._sum.amount ?? 0;

  return {
    totalPool: totalContributions - totalLoansOut + totalLoansPaid,
    totalContributions,
    totalLoansOut,
    totalLoansPaid,
    memberCount,
    meetingCount,
  };
}

/** Active loans past their due date — candidates for reminders (Session 5) or DEFAULTED (Session 6). */
export async function checkOverdueLoans(groupId: string, db: Db = prisma) {
  return db.loan.findMany({
    where: { membership: { groupId }, status: "ACTIVE", dueDate: { lt: new Date() } },
    include: { membership: { include: { user: { select: { name: true } } } } },
    orderBy: { dueDate: "asc" },
  });
}
