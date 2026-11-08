import { Prisma } from "@prisma/client";
import { AuthError, CredentialsSignin } from "next-auth";

/**
 * Auth.js wraps anything `authorize()` throws in a `CallbackRouteError` and
 * hangs the original error on `cause.err`. Unwrap it so a Prisma failure
 * raised during sign-in stays recognisable instead of being flattened into a
 * generic `AuthError`.
 */
export function unwrapAuthError(error: unknown): unknown {
  if (error instanceof AuthError) {
    const cause = error.cause as { err?: unknown } | undefined;
    if (cause?.err instanceof Error) return cause.err;
  }
  return error;
}

export function isDatabaseUnreachable(error: unknown): boolean {
  const err = unwrapAuthError(error);
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P1001") return true;
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  return err instanceof Error && /can't reach database|ECONNREFUSED|ETIMEDOUT/i.test(err.message);
}

/**
 * True only when `authorize()` rejected the phone/PIN pair — Auth.js throws
 * `CredentialsSignin` for exactly that case.
 *
 * Every other `AuthError` (`MissingSecret`, `UntrustedHost`,
 * `CallbackRouteError`, …) is a server-side fault. Those must never be
 * reported as "wrong PIN": doing so makes a broken deployment look like every
 * member suddenly forgot their credentials.
 */
export function isInvalidCredentials(error: unknown): boolean {
  if (error instanceof CredentialsSignin) return true;
  if (!(error instanceof AuthError)) return false;
  if (error.type === "CredentialsSignin") return true;
  return unwrapAuthError(error) instanceof CredentialsSignin;
}
