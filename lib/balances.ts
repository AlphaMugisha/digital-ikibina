import "server-only";
import { prisma } from "@/lib/prisma";

export type MemberBalance = {
  totalContributed: number;
  activeLoanAmount: number;
  netBalance: number;
};

/** All figures in integer cents. Interest is tracked separately from principal. */
export async function calculateMemberBalance(
  membershipId: string,
): Promise<MemberBalance> {
  const [contributions, activeLoans] = await Promise.all([
    prisma.contribution.aggregate({
      where: { membershipId },
      _sum: { amount: true },
    }),
    prisma.loan.aggregate({
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
 */
export async function calculateGroupSummary(groupId: string): Promise<GroupSummary> {
  const [
    contributions,
    loansOut,
    loanPayments,
    memberCount,
    meetingCount,
  ] = await Promise.all([
    prisma.contribution.aggregate({
      where: { membership: { groupId } },
      _sum: { amount: true },
    }),
    prisma.loan.aggregate({
      where: { membership: { groupId }, status: "ACTIVE" },
      _sum: { amount: true },
    }),
    prisma.loanPayment.aggregate({
      where: { loan: { membership: { groupId } } },
      _sum: { amount: true },
    }),
    prisma.membership.count({ where: { groupId } }),
    prisma.meeting.count({ where: { groupId } }),
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
