"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { getTranslations } from "next-intl/server";
import { signIn } from "@/auth";
import { createLoginSchema, type LoginValues } from "@/lib/schemas";

function isDatabaseUnreachable(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P1001") return true;
  return err instanceof Prisma.PrismaClientInitializationError;
}

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
    if (isDatabaseUnreachable(error)) {
      console.error("[loginUser] DB error:", error);
      return { error: tErrors("databaseUnreachable") };
    }
    if (error instanceof AuthError) {
      return { error: invalidCredentials };
    }
    // NEXT_REDIRECT (successful sign-in) and anything unexpected
    throw error;
  }
}
