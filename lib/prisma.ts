import { PrismaClient, Prisma } from "@prisma/client";

const RETRY_DELAYS_MS = [500, 1500, 3000];

function isColdStartError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P1001") return true;
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  return err instanceof Error && /can't reach database|ECONNREFUSED|ETIMEDOUT/i.test(err.message);
}

/** Neon's free tier suspends its compute after a few idle minutes; the first
 * query after that wakes it back up but can take longer than Prisma's
 * default connection timeout. Retrying with backoff rides out that wake-up
 * instead of surfacing a P1001 to the user on every cold start. */
async function retryOnColdStart<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === RETRY_DELAYS_MS.length;
      if (!isColdStartError(err) || isLastAttempt) throw err;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }
  throw lastError;
}

function warnIfMissingConnectionParams() {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.NODE_ENV === "production") return;
  const missing: string[] = [];
  if (!/[?&]connect_timeout=/.test(url)) missing.push("connect_timeout=10");
  if (!/[?&]pool_timeout=/.test(url)) missing.push("pool_timeout=10");
  if (missing.length > 0) {
    console.warn(
      `[prisma] DATABASE_URL is missing recommended query params (${missing.join(", ")}) — ` +
        "add them to ride out Neon cold starts more reliably.",
    );
  }
}

function createExtendedClient() {
  warnIfMissingConnectionParams();

  const baseClient = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return baseClient.$extends({
    query: {
      async $allOperations({ args, query }) {
        return retryOnColdStart(() => query(args));
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient };

export const prisma = globalForPrisma.prisma ?? createExtendedClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** The `tx` client type `$extends` produces for `prisma.$transaction(async (tx) => ...)`
 * callbacks — not the same shape as the plain `Prisma.TransactionClient`. */
export type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
