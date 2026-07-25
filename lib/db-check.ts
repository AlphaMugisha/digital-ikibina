import "server-only";
import { prisma } from "@/lib/prisma";

let checked = false;

/** Runs once per server process; logs whether the DB was reachable at startup. */
export async function ensureDatabaseReady() {
  if (checked) return;
  checked = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("[db-check] database ready");
  } catch (err) {
    console.error("[db-check] database unreachable at startup:", err);
  }
}
