"use server";

import { AuthError } from "next-auth";
import { getTranslations } from "next-intl/server";
import { signIn } from "@/auth";
import { isDatabaseUnreachable, isInvalidCredentials } from "@/lib/auth-errors";
import { createLoginSchema, type LoginValues } from "@/lib/schemas";

export async function loginUser(
  values: LoginValues,
): Promise<{ error: string } | undefined> {
  const [tValidation, tErrors] = await Promise.all([
    getTranslations("validation"),
    getTranslations("errors"),
  ]);

  // Deliberately generic message — never reveal whether the phone exists.
  const invalidCredentials = tErrors("wrongCredentials");

  const parsed = createLoginSchema(tValidation).safeParse(values);
  if (!parsed.success) {
    return { error: invalidCredentials };
  }

  try {
    await signIn("credentials", {
      phone: parsed.data.phone,
      pin: parsed.data.pin,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // Only a real phone/PIN mismatch may be reported as bad credentials.
    if (isInvalidCredentials(error)) {
      return { error: invalidCredentials };
    }
    if (isDatabaseUnreachable(error)) {
      console.error("[loginUser] database unreachable during sign-in:", error);
      return { error: tErrors("databaseUnreachable") };
    }
    if (error instanceof AuthError) {
      // A server-side fault — most commonly a missing `AUTH_SECRET`, which
      // makes Auth.js reject every request with a `Configuration` error.
      // Log the type so it is visible in the platform logs rather than
      // masquerading as a wrong PIN for every member.
      console.error(`[loginUser] auth error (${error.type}):`, error);
      return { error: tErrors("unexpectedError") };
    }
    // NEXT_REDIRECT (successful sign-in) and anything unexpected
    throw error;
  }
}
