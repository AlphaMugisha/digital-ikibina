import "server-only";
import { prisma, type PrismaTransaction } from "@/lib/prisma";

/** Anything with the same query surface as the default client — the
 * singleton, or a `tx` inside `prisma.$transaction(async (tx) => ...)`. */
type Db = typeof prisma | PrismaTransaction;

/** A share-out still in progress — the cycle isn't closed yet, so normal
 * group operations that would change the numbers must be blocked. */
export async function getActiveShareOut(groupId: string, db: Db = prisma) {
  return db.shareOut.findFirst({
    where: { groupId, status: { in: ["DRAFT", "FINALIZED"] } },
  });
}

export async function hasActiveShareOut(groupId: string, db: Db = prisma): Promise<boolean> {
  return (await getActiveShareOut(groupId, db)) !== null;
}
