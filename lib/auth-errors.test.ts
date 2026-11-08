import { describe, expect, it } from "vitest";
import { CallbackRouteError, CredentialsSignin, MissingSecret } from "@auth/core/errors";
import { Prisma } from "@prisma/client";
import { isDatabaseUnreachable, isInvalidCredentials, unwrapAuthError } from "./auth-errors";

/**
 * At runtime Auth.js builds this as `new CallbackRouteError(err, { provider })`
 * (see @auth/core/lib/actions/callback), which puts the original error on
 * `cause.err`. The shipped .d.ts declares no constructor, so TypeScript only
 * sees `Error`'s `(message: string)` overload — hence the cast.
 */
const WrapError = CallbackRouteError as unknown as new (
  err: Error,
  options: Record<string, unknown>,
) => CallbackRouteError;

function wrapAuthorizeFailure(err: Error): CallbackRouteError {
  return new WrapError(err, { provider: "credentials" });
}

describe("isInvalidCredentials", () => {
  it("accepts the error Auth.js throws when authorize() rejects the PIN", () => {
    expect(isInvalidCredentials(new CredentialsSignin())).toBe(true);
  });

  it("does NOT treat a missing AUTH_SECRET as a wrong PIN", () => {
    // This is the production outage: with no AUTH_SECRET, Auth.js fails every
    // request with MissingSecret. Classifying it as bad credentials told every
    // member "Phone or PIN is incorrect" and hid a server misconfiguration.
    expect(isInvalidCredentials(new MissingSecret("Please define a `secret`"))).toBe(false);
  });

  it("does NOT treat a database failure inside authorize() as a wrong PIN", () => {
    const dbError = new Prisma.PrismaClientInitializationError(
      "Can't reach database server",
      "6.19.3",
    );
    const wrapped = wrapAuthorizeFailure(dbError);
    expect(isInvalidCredentials(wrapped)).toBe(false);
  });

  it("ignores non-auth errors", () => {
    expect(isInvalidCredentials(new Error("boom"))).toBe(false);
    expect(isInvalidCredentials(undefined)).toBe(false);
  });
});

describe("isDatabaseUnreachable", () => {
  it("sees through the CallbackRouteError that Auth.js wraps authorize() failures in", () => {
    const dbError = new Prisma.PrismaClientInitializationError(
      "Can't reach database server",
      "6.19.3",
    );
    const wrapped = wrapAuthorizeFailure(dbError);
    expect(isDatabaseUnreachable(wrapped)).toBe(true);
  });

  it("still matches an unwrapped Prisma initialization error", () => {
    const dbError = new Prisma.PrismaClientInitializationError("nope", "6.19.3");
    expect(isDatabaseUnreachable(dbError)).toBe(true);
  });

  it("does not match a missing secret", () => {
    expect(isDatabaseUnreachable(new MissingSecret("Please define a `secret`"))).toBe(false);
  });
});

describe("unwrapAuthError", () => {
  it("returns the original error from cause.err", () => {
    const original = new Error("underlying");
    expect(unwrapAuthError(wrapAuthorizeFailure(original))).toBe(original);
  });

  it("passes through errors with no wrapped cause", () => {
    const plain = new Error("plain");
    expect(unwrapAuthError(plain)).toBe(plain);
  });
});
