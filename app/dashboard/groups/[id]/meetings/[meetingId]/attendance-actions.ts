"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageGroup, getMembership } from "@/lib/permissions";
import type { AttendanceStatus } from "@prisma/client";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type AttendanceEntry = {
  membershipId: string;
  status: AttendanceStatus;
  chargeFine?: boolean;
};

export async function recordAttendance(
  meetingId: string,
  entries: AttendanceEntry[],
): Promise<ActionResult<null>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, groupId: true },
    });
    if (!meeting) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const actingMembership = await getMembership(userId, meeting.groupId);
    if (!canManageGroup(actingMembership)) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const constitution = await prisma.groupConstitution.findUnique({
      where: { groupId: meeting.groupId },
      select: { absenceFineAmount: true },
    });
    const absenceFineAmount = constitution?.absenceFineAmount ?? 0;

    await prisma.$transaction(
      entries.map((entry) => {
        const fineAmount =
          entry.status === "ABSENT" || (entry.status === "LATE" && entry.chargeFine)
            ? absenceFineAmount
            : 0;

        return prisma.meetingAttendance.upsert({
          where: { meetingId_membershipId: { meetingId, membershipId: entry.membershipId } },
          create: {
            meetingId,
            membershipId: entry.membershipId,
            status: entry.status,
            fineAmount,
            recordedBy: userId,
          },
          update: {
            status: entry.status,
            fineAmount,
            recordedBy: userId,
            recordedAt: new Date(),
          },
        });
      }),
    );

    revalidatePath(`/dashboard/groups/${meeting.groupId}/meetings/${meetingId}`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}
