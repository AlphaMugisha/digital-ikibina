"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeRwandanPhone } from "@/lib/phone";
import { getMembership } from "@/lib/permissions";
import type { Role } from "@prisma/client";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function requireLeader(userId: string, groupId: string) {
  const membership = await getMembership(userId, groupId);
  return membership?.role === "LEADER" ? membership : null;
}

export async function addMemberToGroup(
  groupId: string,
  mode: "existing" | "new",
  name: string,
  phone: string,
): Promise<ActionResult<{ membershipId: string }>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  try {
    const leader = await requireLeader(session.user.id, groupId);
    if (!leader) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const normalizedPhone = normalizeRwandanPhone(phone);
    if (!normalizedPhone) {
      return { ok: false, error: tErrors("formInvalid") };
    }

    let userId: string;

    if (mode === "existing") {
      const existingUser = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
      if (!existingUser) {
        return { ok: false, error: tErrors("memberNotFound") };
      }
      userId = existingUser.id;
    } else {
      if (!name.trim()) {
        return { ok: false, error: tErrors("formInvalid") };
      }
      const existingUser = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Placeholder account — no PIN yet. When this person registers with
        // the same phone later, merging happens in Session 5.
        const created = await prisma.user.create({
          data: { name: name.trim(), phone: normalizedPhone, pinHash: "" },
        });
        userId = created.id;
      }
    }

    const alreadyMember = await prisma.membership.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (alreadyMember) {
      return { ok: false, error: tErrors("memberAlreadyInGroup") };
    }

    const membership = await prisma.membership.create({
      data: { userId, groupId, role: "MEMBER" },
      select: { id: true },
    });

    revalidatePath(`/dashboard/groups/${groupId}/members`);
    return { ok: true, data: { membershipId: membership.id } };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}

export async function updateMemberRole(
  groupId: string,
  membershipId: string,
  newRole: Role,
): Promise<ActionResult<null>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  try {
    const leader = await requireLeader(session.user.id, groupId);
    if (!leader) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    if (leader.id === membershipId) {
      return { ok: false, error: tErrors("cannotChangeOwnRole") };
    }

    const target = await prisma.membership.findFirst({
      where: { id: membershipId, groupId },
      select: { id: true },
    });
    if (!target) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    await prisma.membership.update({
      where: { id: membershipId },
      data: { role: newRole },
    });

    revalidatePath(`/dashboard/groups/${groupId}/members`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}
