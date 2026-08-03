"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma, type PrismaTransaction } from "@/lib/prisma";
import { gatherCycleData } from "@/lib/shareout-data";
import {
  calculateShareOut,
  distributeRoundingRemainder,
  type CalculatedAllocation,
} from "@/lib/shareout";
import { createCancelShareOutSchema } from "@/lib/schemas";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function loadShareOutForDecision(tx: PrismaTransaction, shareOutId: string) {
  return tx.shareOut.findUnique({
    where: { id: shareOutId },
    include: { allocations: true },
  });
}

function allocationsMatch(
  fresh: CalculatedAllocation[],
  existing: { membershipId: string; totalContributed: number; interestShare: number; loanDeduction: number; finalPayout: number }[],
): boolean {
  if (fresh.length !== existing.length) return false;
  return fresh.every((a) => {
    const match = existing.find((e) => e.membershipId === a.membershipId);
    return (
      match !== undefined &&
      match.totalContributed === a.totalContributed &&
      match.interestShare === a.interestShare &&
      match.loanDeduction === a.loanDeduction &&
      match.finalPayout === a.finalPayout
    );
  });
}

export async function finalizeShareOut(shareOutId: string): Promise<ActionResult<null>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  try {
    return await prisma.$transaction(async (tx) => {
      const shareOut = await loadShareOutForDecision(tx, shareOutId);
      if (!shareOut) {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      const membership = await tx.membership.findUnique({
        where: { userId_groupId: { userId, groupId: shareOut.groupId } },
      });
      if (membership?.role !== "LEADER") {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      if (shareOut.status !== "DRAFT") {
        return { ok: false, error: tErrors("invalidState") };
      }

      // Someone might have recorded a late contribution or resolved a loan
      // since the draft was created — re-run the numbers and refuse to
      // finalize if anything has moved.
      const { members, totals } = await gatherCycleData(shareOut.groupId, tx);
      const rawAllocations = calculateShareOut(members, totals);
      const freshAllocations = distributeRoundingRemainder(rawAllocations, totals);

      const totalsMatch =
        totals.totalPool === shareOut.totalPool &&
        totals.totalContributions === shareOut.totalContributions &&
        totals.totalInterestEarned === shareOut.totalInterestEarned &&
        totals.totalWrittenOff === shareOut.totalWrittenOff;

      if (!totalsMatch || !allocationsMatch(freshAllocations, shareOut.allocations)) {
        return { ok: false, error: tErrors("numbersChangedRefresh") };
      }

      await tx.shareOut.update({
        where: { id: shareOutId },
        data: { status: "FINALIZED", finalizedAt: new Date(), finalizedBy: userId },
      });

      revalidatePath(`/dashboard/groups/${shareOut.groupId}/share-out/${shareOutId}`);
      revalidatePath(`/dashboard/groups/${shareOut.groupId}`);
      return { ok: true, data: null };
    }, { maxWait: 10_000, timeout: 15_000 });
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}

export async function cancelShareOut(
  shareOutId: string,
  reason: string,
): Promise<ActionResult<null>> {
  const [session, tValidation, tErrors] = await Promise.all([
    auth(),
    getTranslations("validation"),
    getTranslations("errors"),
  ]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  const parsed = createCancelShareOutSchema(tValidation).safeParse({ reason });
  if (!parsed.success) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  try {
    const shareOut = await prisma.shareOut.findUnique({ where: { id: shareOutId } });
    if (!shareOut) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const membership = await prisma.membership.findUnique({
      where: { userId_groupId: { userId, groupId: shareOut.groupId } },
    });
    if (membership?.role !== "LEADER") {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    if (shareOut.status !== "DRAFT") {
      return { ok: false, error: tErrors("invalidState") };
    }

    await prisma.shareOut.update({
      where: { id: shareOutId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: userId,
        notes: parsed.data.reason,
      },
    });

    revalidatePath(`/dashboard/groups/${shareOut.groupId}`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}
