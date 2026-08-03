"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCompleteShareOutSchema } from "@/lib/schemas";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function markAllocationPaid(
  allocationId: string,
  note?: string,
): Promise<ActionResult<null>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  try {
    const allocation = await prisma.shareOutAllocation.findUnique({
      where: { id: allocationId },
      include: { shareOut: { select: { id: true, groupId: true, status: true } } },
    });
    if (!allocation) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const membership = await prisma.membership.findUnique({
      where: { userId_groupId: { userId, groupId: allocation.shareOut.groupId } },
    });
    if (membership?.role !== "LEADER") {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    if (allocation.shareOut.status !== "FINALIZED") {
      return { ok: false, error: tErrors("invalidState") };
    }

    await prisma.shareOutAllocation.update({
      where: { id: allocationId },
      data: { status: "PAID", paidAt: new Date(), paidBy: userId, note: note?.trim() || null },
    });

    revalidatePath(`/dashboard/groups/${allocation.shareOut.groupId}/share-out/${allocation.shareOut.id}/payout`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}

export async function markAllAllocationsPaid(
  shareOutId: string,
): Promise<ActionResult<{ count: number }>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

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

    if (shareOut.status !== "FINALIZED") {
      return { ok: false, error: tErrors("invalidState") };
    }

    const result = await prisma.shareOutAllocation.updateMany({
      where: { shareOutId, status: "PENDING" },
      data: { status: "PAID", paidAt: new Date(), paidBy: userId },
    });

    revalidatePath(`/dashboard/groups/${shareOut.groupId}/share-out/${shareOutId}/payout`);
    return { ok: true, data: { count: result.count } };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}

export async function completeShareOut(
  shareOutId: string,
  newCycleStart: string,
  newCycleEnd: string,
): Promise<ActionResult<{ groupId: string; cycleNumber: number }>> {
  const [session, tValidation, tErrors] = await Promise.all([
    auth(),
    getTranslations("validation"),
    getTranslations("errors"),
  ]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  const parsed = createCompleteShareOutSchema(tValidation).safeParse({
    cycleStart: newCycleStart,
    cycleEnd: newCycleEnd,
  });
  if (!parsed.success) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const shareOut = await tx.shareOut.findUnique({
        where: { id: shareOutId },
        include: { allocations: { select: { status: true } } },
      });
      if (!shareOut) {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      const membership = await tx.membership.findUnique({
        where: { userId_groupId: { userId, groupId: shareOut.groupId } },
      });
      if (membership?.role !== "LEADER") {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      if (shareOut.status !== "FINALIZED") {
        return { ok: false, error: tErrors("invalidState") };
      }

      const allPaidOrWaived = shareOut.allocations.every(
        (a) => a.status === "PAID" || a.status === "WAIVED",
      );
      if (!allPaidOrWaived) {
        return { ok: false, error: tErrors("invalidState") };
      }

      await tx.shareOut.update({
        where: { id: shareOutId },
        data: { status: "COMPLETED", completedAt: new Date(), completedBy: userId },
      });

      // ACTIVE loans carry forward untouched — they simply now belong to
      // the new cycle's balances instead of being written off.
      const updatedGroup = await tx.group.update({
        where: { id: shareOut.groupId },
        data: {
          cycleStart: new Date(parsed.data.cycleStart),
          cycleEnd: new Date(parsed.data.cycleEnd),
          cycleNumber: { increment: 1 },
        },
        select: { cycleNumber: true },
      });

      revalidatePath(`/dashboard/groups/${shareOut.groupId}`);
      return { ok: true, data: { groupId: shareOut.groupId, cycleNumber: updatedGroup.cycleNumber } };
    }, { maxWait: 10_000, timeout: 15_000 });
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}
