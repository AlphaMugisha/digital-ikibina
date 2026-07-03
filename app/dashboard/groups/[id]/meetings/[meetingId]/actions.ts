"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCents } from "@/lib/money";
import { canManageGroup, getMembership } from "@/lib/permissions";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function getMeetingWithGroup(meetingId: string) {
  return prisma.meeting.findUnique({
    where: { id: meetingId },
    select: { id: true, groupId: true },
  });
}

export async function recordContribution(
  meetingId: string,
  membershipId: string,
  amountRwf: string,
  note: string,
): Promise<ActionResult<{ amountCents: number }>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const meeting = await getMeetingWithGroup(meetingId);
  if (!meeting) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const actingMembership = await getMembership(session.user.id, meeting.groupId);
  if (!canManageGroup(actingMembership)) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  // The member being recorded must belong to the same group as the meeting.
  const targetMembership = await prisma.membership.findFirst({
    where: { id: membershipId, groupId: meeting.groupId },
    select: { id: true },
  });
  if (!targetMembership) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  let amountCents: number;
  try {
    amountCents = toCents(amountRwf);
  } catch {
    amountCents = -1;
  }
  if (amountCents <= 0) {
    return { ok: false, error: tErrors("invalidAmount") };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.contribution.upsert({
        where: { membershipId_meetingId: { membershipId, meetingId } },
        create: {
          membershipId,
          meetingId,
          amount: amountCents,
          note: note.trim() || null,
          recordedBy: session.user.id,
        },
        update: {
          amount: amountCents,
          note: note.trim() || null,
          recordedBy: session.user.id,
        },
      });

      const total = await tx.contribution.aggregate({
        where: { meetingId },
        _sum: { amount: true },
      });

      await tx.meeting.update({
        where: { id: meetingId },
        data: { totalCollected: total._sum.amount ?? 0 },
      });
    });
  } catch {
    return { ok: false, error: tErrors("contributionSaveFailed") };
  }

  revalidatePath(`/dashboard/groups/${meeting.groupId}/meetings/${meetingId}`);
  return { ok: true, data: { amountCents } };
}

export async function endMeeting(
  meetingId: string,
  notes: string,
): Promise<ActionResult<{ groupId: string }>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const meeting = await getMeetingWithGroup(meetingId);
  if (!meeting) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const actingMembership = await getMembership(session.user.id, meeting.groupId);
  if (!canManageGroup(actingMembership)) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { notes: notes.trim() || null },
  });

  revalidatePath(`/dashboard/groups/${meeting.groupId}/meetings`);
  return { ok: true, data: { groupId: meeting.groupId } };
}
