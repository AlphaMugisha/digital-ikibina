"use server";

import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/permissions";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  membershipId: string;
  senderName: string;
};

const MESSAGE_HISTORY_LIMIT = 100;

export async function getMessages(groupId: string): Promise<ActionResult<ChatMessage[]>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const membership = await getMembership(session.user.id, groupId);
  if (!membership) {
    return { ok: false, error: tErrors("notGroupMember") };
  }

  const messages = await prisma.message.findMany({
    where: { groupId },
    include: { membership: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: MESSAGE_HISTORY_LIMIT,
  });

  return {
    ok: true,
    data: messages
      .reverse()
      .map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        membershipId: m.membershipId,
        senderName: m.membership.user.name,
      })),
  };
}

export async function sendMessage(groupId: string, body: string): Promise<ActionResult<ChatMessage>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const trimmed = body.trim();
  if (trimmed.length === 0 || trimmed.length > 1000) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  const membership = await getMembership(session.user.id, groupId);
  if (!membership) {
    return { ok: false, error: tErrors("notGroupMember") };
  }

  try {
    const message = await prisma.message.create({
      data: { groupId, membershipId: membership.id, body: trimmed },
      include: { membership: { include: { user: { select: { name: true } } } } },
    });

    return {
      ok: true,
      data: {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        membershipId: message.membershipId,
        senderName: message.membership.user.name,
      },
    };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}
