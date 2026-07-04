import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/permissions";

/**
 * React's `cache()` dedupes this across the [id] layout and its child page
 * in the same request, so we only hit the DB once per navigation even
 * though both need the group + the current user's membership.
 */
export const getGroupWithMembership = cache(async (userId: string, groupId: string) => {
  const [group, membership] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    getMembership(userId, groupId),
  ]);
  return { group, membership };
});
