"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma, type PrismaTransaction } from "@/lib/prisma";
import { hasActiveShareOut } from "@/lib/shareout-guard";
import { calculateGroupSummary } from "@/lib/balances";
import { calculateBorrowingLimit, calculateGroupLendingCapacity } from "@/lib/loans";
import { createRejectLoanSchema } from "@/lib/schemas";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function loadLoanForDecision(loanId: string) {
  return prisma.loan.findUnique({
    where: { id: loanId },
    select: {
      id: true,
      status: true,
      amount: true,
      membershipId: true,
      membership: { select: { groupId: true } },
    },
  });
}

export async function approveLoan(loanId: string): Promise<ActionResult<null>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  try {
    return await prisma.$transaction(async (tx) => {
      const loan = await loadLoanForDecisionTx(tx, loanId);
      if (!loan) {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      const leaderMembership = await tx.membership.findUnique({
        where: { userId_groupId: { userId, groupId: loan.membership.groupId } },
      });
      if (leaderMembership?.role !== "LEADER") {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      if (loan.status !== "PENDING") {
        return { ok: false, error: tErrors("loanNotPending") };
      }

      if (await hasActiveShareOut(loan.membership.groupId, tx)) {
        return { ok: false, error: tErrors("shareOutInProgress") };
      }

      const group = await tx.group.findUnique({ where: { id: loan.membership.groupId } });
      if (!group) {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      // Re-check limits — conditions may have changed since the request was made.
      const [contributions, activeLoans, groupSummary] = await Promise.all([
        tx.contribution.aggregate({
          where: { membershipId: loan.membershipId },
          _sum: { amount: true },
        }),
        tx.loan.aggregate({
          where: { membershipId: loan.membershipId, status: "ACTIVE" },
          _sum: { amount: true },
        }),
        calculateGroupSummary(group.id, tx),
      ]);

      const borrowingLimit = calculateBorrowingLimit(
        contributions._sum.amount ?? 0,
        activeLoans._sum.amount ?? 0,
        group.maxLoanMultiplier,
      );
      if (loan.amount > borrowingLimit) {
        return { ok: false, error: tErrors("borrowingLimitExceeded") };
      }

      const lendingCapacity = calculateGroupLendingCapacity(groupSummary);
      if (loan.amount > lendingCapacity) {
        return { ok: false, error: tErrors("lendingCapacityExceeded") };
      }

      await tx.loan.update({
        where: { id: loanId },
        data: { status: "APPROVED", approvedAt: new Date(), approvedBy: userId },
      });

      revalidatePath(`/dashboard/groups/${loan.membership.groupId}/loans/pending`);
      return { ok: true, data: null };
    }, { maxWait: 10_000, timeout: 15_000 });
  } catch {
    return { ok: false, error: tErrors("loanActionFailed") };
  }
}

export async function rejectLoan(loanId: string, reason: string): Promise<ActionResult<null>> {
  const [session, tValidation, tErrors] = await Promise.all([
    auth(),
    getTranslations("validation"),
    getTranslations("errors"),
  ]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const parsed = createRejectLoanSchema(tValidation).safeParse({ reason });
  if (!parsed.success) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  try {
    const loan = await loadLoanForDecision(loanId);
    if (!loan) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const leaderMembership = await prisma.membership.findUnique({
      where: { userId_groupId: { userId: session.user.id, groupId: loan.membership.groupId } },
    });
    if (leaderMembership?.role !== "LEADER") {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    if (loan.status !== "PENDING") {
      return { ok: false, error: tErrors("loanNotPending") };
    }

    await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectedBy: session.user.id,
        rejectionReason: parsed.data.reason,
      },
    });

    revalidatePath(`/dashboard/groups/${loan.membership.groupId}/loans/pending`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: tErrors("loanActionFailed") };
  }
}

export async function disburseLoan(loanId: string): Promise<ActionResult<null>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  try {
    return await prisma.$transaction(async (tx) => {
      const loan = await loadLoanForDecisionTx(tx, loanId);
      if (!loan) {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      const membership = await tx.membership.findUnique({
        where: { userId_groupId: { userId, groupId: loan.membership.groupId } },
      });
      if (membership?.role !== "LEADER" && membership?.role !== "SECRETARY") {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      // Re-check status inside the transaction — guards against two people
      // disbursing the same loan at the same time.
      if (loan.status !== "APPROVED") {
        return { ok: false, error: tErrors("loanNotApproved") };
      }

      if (await hasActiveShareOut(loan.membership.groupId, tx)) {
        return { ok: false, error: tErrors("shareOutInProgress") };
      }

      await tx.loan.update({
        where: { id: loanId },
        data: { status: "ACTIVE", takenAt: new Date() },
      });

      revalidatePath(`/dashboard/groups/${loan.membership.groupId}/loans/pending`);
      return { ok: true, data: null };
    }, { maxWait: 10_000, timeout: 15_000 });
  } catch {
    return { ok: false, error: tErrors("loanActionFailed") };
  }
}

async function loadLoanForDecisionTx(tx: PrismaTransaction, loanId: string) {
  return tx.loan.findUnique({
    where: { id: loanId },
    select: {
      id: true,
      status: true,
      amount: true,
      membershipId: true,
      membership: { select: { groupId: true } },
    },
  });
}
