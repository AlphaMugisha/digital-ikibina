"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/permissions";
import { gatherCycleData } from "@/lib/shareout-data";
import { getActiveShareOut } from "@/lib/shareout-guard";
import {
  calculateShareOut,
  distributeRoundingRemainder,
  verifyShareOutBalance,
} from "@/lib/shareout";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function initiateShareOut(
  groupId: string,
): Promise<ActionResult<{ shareOutId: string }>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  try {
    const membership = await getMembership(userId, groupId);
    if (membership?.role !== "LEADER") {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const activeShareOut = await getActiveShareOut(groupId);
    if (activeShareOut) {
      return { ok: false, error: tErrors("shareOutInProgress") };
    }

    // Loans still awaiting a decision must be actioned (approved+disbursed,
    // or rejected) before a share-out can be started — ACTIVE loans are
    // fine, they just carry forward as loanDeductions.
    const blockingLoans = await prisma.loan.count({
      where: { membership: { groupId }, status: { in: ["PENDING", "APPROVED"] } },
    });
    if (blockingLoans > 0) {
      return { ok: false, error: tErrors("cannotFinalizeWithPendingLoans") };
    }

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const { members, totals } = await gatherCycleData(groupId);
    const rawAllocations = calculateShareOut(members, totals);
    const allocations = distributeRoundingRemainder(rawAllocations, totals);

    const verification = verifyShareOutBalance(allocations, totals);
    if (!verification.ok) {
      return { ok: false, error: tErrors("balanceDiscrepancy") };
    }

    const shareOutId = await prisma.$transaction(async (tx) => {
      const created = await tx.shareOut.create({
        data: {
          groupId,
          cycleStart: group.cycleStart,
          cycleEnd: group.cycleEnd,
          totalPool: totals.totalPool,
          totalContributions: totals.totalContributions,
          totalInterestEarned: totals.totalInterestEarned,
          totalWrittenOff: totals.totalWrittenOff,
          memberCount: members.length,
          initiatedBy: userId,
        },
        select: { id: true },
      });

      if (allocations.length > 0) {
        await tx.shareOutAllocation.createMany({
          data: allocations.map((a) => ({
            shareOutId: created.id,
            membershipId: a.membershipId,
            totalContributed: a.totalContributed,
            interestShare: a.interestShare,
            loanDeduction: a.loanDeduction,
            finalPayout: a.finalPayout,
          })),
        });
      }

      return created.id;
    }, { maxWait: 10_000, timeout: 15_000 });

    revalidatePath(`/dashboard/groups/${groupId}`);
    return { ok: true, data: { shareOutId } };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}
