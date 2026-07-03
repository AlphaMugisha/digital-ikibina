"use server";

import { AuthError } from "next-auth";
import { getTranslations } from "next-intl/server";
import { signIn } from "@/auth";
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
    if (error instanceof AuthError) {
      return { error: invalidCredentials };
    }
    // NEXT_REDIRECT (successful sign-in) and anything unexpected
    throw error;
  }
}
