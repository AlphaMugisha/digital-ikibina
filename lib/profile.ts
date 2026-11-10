import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { calculateAmountOwed } from "@/lib/loans";
import {
  directionFor,
  type FinancialSummary,
  type LedgerEntry,
  sortLedger,
} from "@/lib/profile-ledger";

/**
 * Profile data access.
 *
 * Every query here is scoped by `userId` (directly, or through
 * `membership: { userId }`). No function takes a group id or membership id
 * from a caller without also constraining on the owning user, so a member can
 * only ever read their own record.
 */

export type ProfileUser = {
  id: string;
  name: string;
  phone: string;
  nationalId: string | null;
  preferredLocale: string | null;
  createdAt: Date;
  membershipCount: number;
};

/** `cache` dedupes this across the layout and the page within one request. */
export const getProfileUser = cache(
  async (userId: string): Promise<ProfileUser | null> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        nationalId: true,
        preferredLocale: true,
        createdAt: true,
        _count: { select: { memberships: true } },
      },
    });

    if (!user) return null;

    const { _count, ...rest } = user;
    return { ...rest, membershipCount: _count.memberships };
  },
);

/**
 * A short, human-quotable member reference derived from the cuid. Not a new
 * database field — just the tail of the existing id, which is already unique.
 */
export function memberReference(userId: string): string {
  return userId.slice(-6).toUpperCase();
}

export type ProfileMembership = {
  membershipId: string;
  groupId: string;
  groupName: string;
  role: "LEADER" | "SECRETARY" | "MEMBER";
  joinedAt: Date;
  memberCount: number;
  cycleNumber: number;
};

export const getProfileMemberships = cache(
  async (userId: string): Promise<ProfileMembership[]> => {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      orderBy: { joinedAt: "desc" },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        group: {
          select: {
            id: true,
            name: true,
            cycleNumber: true,
            _count: { select: { memberships: true } },
          },
        },
      },
    });

    return memberships.map((m) => ({
      membershipId: m.id,
      groupId: m.group.id,
      groupName: m.group.name,
      role: m.role,
      joinedAt: m.joinedAt,
      memberCount: m.group._count.memberships,
      cycleNumber: m.group.cycleNumber,
    }));
  },
);

/**
 * Headline totals across every ikimina the member belongs to.
 *
 * `outstandingLoans` uses `calculateAmountOwed`, so it includes accrued
 * interest and unpaid late fees rather than bare principal — the figure a
 * borrower would actually have to hand over today.
 */
export const getFinancialSummary = cache(
  async (userId: string): Promise<FinancialSummary> => {
    const [contributions, repayments, distributions, openLoans] = await Promise.all([
      prisma.contribution.aggregate({
        where: { membership: { userId } },
        _sum: { amount: true },
      }),
      prisma.loanPayment.aggregate({
        where: { loan: { membership: { userId } } },
        _sum: { amount: true },
      }),
      prisma.shareOutAllocation.aggregate({
        where: { membership: { userId }, status: "PAID" },
        _sum: { finalPayout: true },
      }),
      prisma.loan.findMany({
        where: { membership: { userId }, status: { in: ["ACTIVE", "DEFAULTED"] } },
        select: {
          amount: true,
          interestRate: true,
          takenAt: true,
          lateFeesAccrued: true,
          payments: { select: { amount: true } },
        },
      }),
    ]);

    const now = new Date();
    const outstandingLoans = openLoans.reduce(
      (sum, loan) => sum + calculateAmountOwed(loan, loan.payments, now).totalOwed,
      0,
    );

    return {
      totalContributions: contributions._sum.amount ?? 0,
      outstandingLoans,
      totalRepaid: repayments._sum.amount ?? 0,
      distributionsReceived: distributions._sum.finalPayout ?? 0,
    };
  },
);

/**
 * Every recorded money movement for this member, newest first.
 *
 * Five separate tables feed the ledger, so the merge happens in application
 * code rather than SQL. Entry ids are prefixed by source to keep them unique
 * across tables.
 */
export const getLedger = cache(async (userId: string): Promise<LedgerEntry[]> => {
  const groupOf = {
    membership: { select: { group: { select: { id: true, name: true } } } },
  } as const;

  const [contributions, disbursed, repayments, allocations, fines] = await Promise.all([
    prisma.contribution.findMany({
      where: { membership: { userId } },
      select: { id: true, amount: true, createdAt: true, note: true, ...groupOf },
    }),
    prisma.loan.findMany({
      where: { membership: { userId }, takenAt: { not: null } },
      select: {
        id: true,
        amount: true,
        takenAt: true,
        status: true,
        purpose: true,
        ...groupOf,
      },
    }),
    prisma.loanPayment.findMany({
      where: { loan: { membership: { userId } } },
      select: {
        id: true,
        amount: true,
        paidAt: true,
        note: true,
        loan: { select: { status: true, ...groupOf } },
      },
    }),
    prisma.shareOutAllocation.findMany({
      where: { membership: { userId }, status: "PAID" },
      select: {
        id: true,
        finalPayout: true,
        paidAt: true,
        status: true,
        note: true,
        ...groupOf,
      },
    }),
    prisma.meetingAttendance.findMany({
      where: { membership: { userId }, fineAmount: { gt: 0 } },
      select: {
        id: true,
        fineAmount: true,
        finePaid: true,
        paidAt: true,
        recordedAt: true,
        note: true,
        ...groupOf,
      },
    }),
  ]);

  const entries: LedgerEntry[] = [
    ...contributions.map((row) => ({
      id: `contribution:${row.id}`,
      date: row.createdAt,
      category: "contribution" as const,
      direction: directionFor("contribution"),
      amount: row.amount,
      groupId: row.membership.group.id,
      groupName: row.membership.group.name,
      status: null,
      note: row.note,
    })),
    ...disbursed.map((row) => ({
      id: `disbursement:${row.id}`,
      // Filtered on `takenAt: { not: null }`, so this is always a date.
      date: row.takenAt as Date,
      category: "disbursement" as const,
      direction: directionFor("disbursement"),
      amount: row.amount,
      groupId: row.membership.group.id,
      groupName: row.membership.group.name,
      status: row.status,
      note: row.purpose,
    })),
    ...repayments.map((row) => ({
      id: `repayment:${row.id}`,
      date: row.paidAt,
      category: "repayment" as const,
      direction: directionFor("repayment"),
      amount: row.amount,
      groupId: row.loan.membership.group.id,
      groupName: row.loan.membership.group.name,
      status: row.loan.status,
      note: row.note,
    })),
    ...allocations.map((row) => ({
      id: `distribution:${row.id}`,
      date: row.paidAt ?? new Date(0),
      category: "distribution" as const,
      direction: directionFor("distribution"),
      amount: row.finalPayout,
      groupId: row.membership.group.id,
      groupName: row.membership.group.name,
      status: row.status,
      note: row.note,
    })),
    ...fines.map((row) => ({
      id: `fine:${row.id}`,
      date: row.paidAt ?? row.recordedAt,
      category: "fine" as const,
      direction: directionFor("fine"),
      amount: row.fineAmount,
      groupId: row.membership.group.id,
      groupName: row.membership.group.name,
      status: row.finePaid ? "PAID" : "PENDING",
      note: row.note,
    })),
  ];

  return sortLedger(entries);
});
