"use server";

import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMembership, canManageGroup } from "@/lib/permissions";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function createMeeting(
  groupId: string,
  date: string,
  notes: string,
): Promise<ActionResult<{ meetingId: string }>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const membership = await getMembership(session.user.id, groupId);
  if (!canManageGroup(membership)) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  try {
    const meeting = await prisma.meeting.create({
      data: {
        groupId,
        date: parsedDate,
        notes: notes.trim() || null,
      },
      select: { id: true },
    });
    return { ok: true, data: { meetingId: meeting.id } };
  } catch {
    return { ok: false, error: tErrors("meetingCreateFailed") };
  }
}
