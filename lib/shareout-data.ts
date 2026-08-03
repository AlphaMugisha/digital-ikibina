import "server-only";
import { prisma, type PrismaTransaction } from "@/lib/prisma";
import type { MemberCycleData, GroupCycleTotals } from "@/lib/shareout";

/** Anything with the same query surface as the default client — the
 * singleton, or a `tx` inside `prisma.$transaction(async (tx) => ...)`. */
type Db = typeof prisma | PrismaTransaction;

export type CycleData = {
  members: MemberCycleData[];
  totals: GroupCycleTotals;
};

/**
 * Gathers everything needed to run `calculateShareOut` for a group's current
 * cycle: each active member's contributions + any carried-forward loan
 * principal, and the group-wide totals (pool, contributions, interest
 * earned, write-offs). Only counts activity dated within [cycleStart, cycleEnd].
 */
export async function gatherCycleData(groupId: string, db: Db = prisma): Promise<CycleData> {
  const group = await db.group.findUniqueOrThrow({
    where: { id: groupId },
    select: { cycleStart: true, cycleEnd: true },
  });

  const [memberships, paidLoansInCycle, defaultedLoansInCycle, carriedLoans] = await Promise.all([
    db.membership.findMany({
      where: { groupId },
      select: {
        id: true,
        contributions: {
          where: { meeting: { date: { gte: group.cycleStart, lte: group.cycleEnd } } },
          select: { amount: true },
        },
      },
    }),
    db.loan.findMany({
      where: {
        membership: { groupId },
        status: "PAID",
        takenAt: { gte: group.cycleStart, lte: group.cycleEnd },
      },
      include: { payments: true },
    }),
    db.loan.findMany({
      where: {
        membership: { groupId },
        status: "DEFAULTED",
        takenAt: { gte: group.cycleStart, lte: group.cycleEnd },
      },
      select: { amount: true },
    }),
    db.loan.findMany({
      where: { membership: { groupId }, status: "ACTIVE" },
      select: { membershipId: true, amount: true },
    }),
  ]);

  const carriedByMembership = new Map<string, number>();
  for (const loan of carriedLoans) {
    carriedByMembership.set(
      loan.membershipId,
      (carriedByMembership.get(loan.membershipId) ?? 0) + loan.amount,
    );
  }

  const members: MemberCycleData[] = memberships.map((m) => ({
    membershipId: m.id,
    totalContributed: m.contributions.reduce((s, c) => s + c.amount, 0),
    carriedForwardLoan: carriedByMembership.get(m.id) ?? 0,
  }));

  const totalContributions = members.reduce((s, m) => s + m.totalContributed, 0);

  // Interest earned = the interest portion of payments made against loans
  // that were fully PAID within the cycle: total payments received minus
  // the principal that was repaid (i.e. loan.amount).
  const totalInterestEarned = paidLoansInCycle.reduce((sum, loan) => {
    const totalPaid = loan.payments.reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, totalPaid - loan.amount);
  }, 0);

  const totalWrittenOff = defaultedLoansInCycle.reduce((sum, loan) => sum + loan.amount, 0);

  const totalPool = totalContributions + totalInterestEarned - totalWrittenOff;

  return {
    members,
    totals: {
      totalPool,
      totalContributions,
      totalInterestEarned,
      totalWrittenOff,
    },
  };
}
