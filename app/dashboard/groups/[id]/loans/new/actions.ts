"use server";

import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCents } from "@/lib/money";
import { getMembership } from "@/lib/permissions";
import { hasActiveShareOut } from "@/lib/shareout-guard";
import { calculateGroupSummary } from "@/lib/balances";
import { calculateBorrowingLimit, calculateGroupLendingCapacity } from "@/lib/loans";
import { createLoanRequestSchema } from "@/lib/schemas";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const MS_PER_DAY = 86_400_000;

export async function requestLoan(
  groupId: string,
  amount: string,
  purpose: string,
  dueDate: string,
  guarantorId: string,
): Promise<ActionResult<{ loanId: string }>> {
  const [session, tValidation, tErrors] = await Promise.all([
    auth(),
    getTranslations("validation"),
    getTranslations("errors"),
  ]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const parsed = createLoanRequestSchema(tValidation).safeParse({
    amount,
    purpose,
    dueDate,
    guarantorId,
  });
  if (!parsed.success) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  try {
    const membership = await getMembership(session.user.id, groupId);
    if (!membership) {
      return { ok: false, error: tErrors("notGroupMember") };
    }

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return { ok: false, error: tErrors("notGroupMember") };
    }

    if (await hasActiveShareOut(groupId)) {
      return { ok: false, error: tErrors("shareOutInProgress") };
    }

    const amountCents = toCents(parsed.data.amount);
    const parsedDueDate = new Date(parsed.data.dueDate);
    const maxDue = Date.now() + group.maxLoanDurationDays * MS_PER_DAY;
    if (parsedDueDate.getTime() > maxDue) {
      return { ok: false, error: tErrors("dueDateTooFar") };
    }

    let resolvedGuarantorId: string | null = null;
    if (parsed.data.guarantorId) {
      if (parsed.data.guarantorId === membership.id) {
        return { ok: false, error: tErrors("guarantorInvalid") };
      }
      const guarantorMembership = await prisma.membership.findFirst({
        where: { id: parsed.data.guarantorId, groupId },
        select: { id: true },
      });
      if (!guarantorMembership) {
        return { ok: false, error: tErrors("guarantorInvalid") };
      }
      resolvedGuarantorId = guarantorMembership.id;
    }
    if (group.requireGuarantor && !resolvedGuarantorId) {
      return { ok: false, error: tErrors("guarantorRequired") };
    }

    const [contributions, activeLoans, groupSummary, constitution] = await Promise.all([
      prisma.contribution.aggregate({
        where: { membershipId: membership.id },
        _sum: { amount: true },
      }),
      prisma.loan.aggregate({
        where: { membershipId: membership.id, status: "ACTIVE" },
        _sum: { amount: true },
      }),
      calculateGroupSummary(groupId),
      prisma.groupConstitution.findUnique({
        where: { groupId },
        select: { latenessGraceDays: true, lateFeeType: true, lateFeeAmount: true },
      }),
    ]);

    const borrowingLimit = calculateBorrowingLimit(
      contributions._sum.amount ?? 0,
      activeLoans._sum.amount ?? 0,
      group.maxLoanMultiplier,
    );
    if (amountCents > borrowingLimit) {
      return { ok: false, error: tErrors("borrowingLimitExceeded") };
    }

    const lendingCapacity = calculateGroupLendingCapacity(groupSummary);
    if (amountCents > lendingCapacity) {
      return { ok: false, error: tErrors("lendingCapacityExceeded") };
    }

    const autoApprove = !group.requireApproval;
    const loan = await prisma.loan.create({
      data: {
        membershipId: membership.id,
        amount: amountCents,
        interestRate: group.interestRate, // snapshot at request time, not disbursement
        dueDate: parsedDueDate,
        purpose: parsed.data.purpose,
        guarantorId: resolvedGuarantorId,
        status: autoApprove ? "APPROVED" : "PENDING",
        approvedAt: autoApprove ? new Date() : null,
        // Late-fee terms are locked in at request time — a later constitution
        // edit must never retroactively change fees on an existing loan.
        latenessGraceDays: constitution?.latenessGraceDays ?? 0,
        lateFeeType: constitution?.lateFeeType ?? "NONE",
        lateFeeAmount: constitution?.lateFeeAmount ?? 0,
      },
      select: { id: true },
    });

    return { ok: true, data: { loanId: loan.id } };
  } catch {
    return { ok: false, error: tErrors("loanRequestFailed") };
  }
}
