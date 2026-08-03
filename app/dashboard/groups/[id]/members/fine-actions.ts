"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function markFinePaid(attendanceId: string): Promise<ActionResult<null>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  try {
    const attendance = await prisma.meetingAttendance.findUnique({
      where: { id: attendanceId },
      select: { id: true, meeting: { select: { groupId: true } } },
    });
    if (!attendance) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const membership = await prisma.membership.findUnique({
      where: { userId_groupId: { userId: session.user.id, groupId: attendance.meeting.groupId } },
    });
    if (membership?.role !== "LEADER" && membership?.role !== "SECRETARY") {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    await prisma.meetingAttendance.update({
      where: { id: attendanceId },
      data: { finePaid: true, paidAt: new Date() },
    });

    revalidatePath(`/dashboard/groups/${attendance.meeting.groupId}/members`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}
