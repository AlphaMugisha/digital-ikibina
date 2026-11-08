import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hasAuthSecret } from "@/lib/auth-check";

export async function GET() {
  // Presence only, never the value — a missing AUTH_SECRET breaks all sign-in,
  // so it needs to be checkable without access to the deployment logs.
  const auth = hasAuthSecret() ? "configured" : "missing-secret";

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: hasAuthSecret(), db: "connected", auth });
  } catch {
    return NextResponse.json({ ok: false, db: "disconnected", auth }, { status: 503 });
  }
}
