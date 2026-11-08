import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAuthSecret } from "@/lib/auth-check";

/** Maps the Prisma codes worth distinguishing here. A connection that works
 * while table queries fail means the schema was never pushed to this
 * database — `SELECT 1` alone cannot tell those apart. */
function describeSchemaError(err: unknown): string {
  if (err instanceof Prisma.PrismaClientInitializationError) return "unreachable";
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P1001":
        return "unreachable";
      case "P2021":
        return "missing-table";
      case "P2022":
        return "missing-column";
      case "P1010":
        return "access-denied";
      default:
        return `prisma-${err.code}`;
    }
  }
  return "unknown-error";
}

export async function GET() {
  // Presence only, never the value — a missing AUTH_SECRET breaks all sign-in,
  // so it needs to be checkable without access to the deployment logs.
  const auth = hasAuthSecret() ? "configured" : "missing-secret";

  let db = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "disconnected";
  }

  // Touch a real table: this is what sign-up and sign-in actually depend on.
  let schema = "ready";
  if (db === "connected") {
    try {
      await prisma.user.count();
    } catch (err) {
      schema = describeSchemaError(err);
      console.error("[health] User table not queryable:", err);
    }
  } else {
    schema = "unknown";
  }

  const ok = db === "connected" && schema === "ready" && auth === "configured";
  return NextResponse.json({ ok, db, schema, auth }, { status: ok ? 200 : 503 });
}
