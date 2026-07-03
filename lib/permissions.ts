import "server-only";
import type { Membership } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Fetch the current user's membership in a group, or null if they aren't a member. */
export async function getMembership(
  userId: string,
  groupId: string,
): Promise<Membership | null> {
  return prisma.membership.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
}

/** LEADER or SECRETARY may record/start/end meetings and manage members. */
export function canManageGroup(membership: Membership | null): boolean {
  return membership?.role === "LEADER" || membership?.role === "SECRETARY";
}
