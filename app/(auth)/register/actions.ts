"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { getTranslations } from "next-intl/server";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeRwandanPhone } from "@/lib/phone";
import { isDatabaseUnreachable } from "@/lib/auth-errors";
import { createRegisterSchema, type RegisterValues } from "@/lib/schemas";
import { getUserLocale } from "@/i18n/locale";

export async function registerUser(
  values: RegisterValues,
): Promise<{ error: string } | undefined> {
  const [tValidation, tErrors] = await Promise.all([
    getTranslations("validation"),
    getTranslations("errors"),
  ]);

  const parsed = createRegisterSchema(tValidation).safeParse(values);
  if (!parsed.success) {
    return { error: tErrors("formInvalid") };
  }

  const phone = normalizeRwandanPhone(parsed.data.phone);
  if (!phone) {
    return { error: tValidation("phoneInvalid") };
  }

  let existing;
  try {
    existing = await prisma.user.findUnique({ where: { phone } });
  } catch (err) {
    console.error("[registerUser] DB error:", err);
    return { error: tErrors(isDatabaseUnreachable(err) ? "databaseUnreachable" : "unexpectedError") };
  }
  if (existing) {
    return { error: tErrors("phoneAlreadyExists") };
  }

  const pinHash = await bcrypt.hash(parsed.data.pin, 10);
  const locale = await getUserLocale();

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        phone,
        nationalId: parsed.data.nationalId || null,
        pinHash,
        preferredLocale: locale,
      },
    });
  } catch (err) {
    console.error("[registerUser] DB error:", err);
    if (isDatabaseUnreachable(err)) {
      return { error: tErrors("databaseUnreachable") };
    }
    // Unique-constraint race on phone/nationalId or another write failure —
    // never leak Prisma internals to the user.
    return { error: tErrors("registrationFailed") };
  }

  // Sign in with the same credentials and land on the dashboard.
  // On success this throws NEXT_REDIRECT, which Next.js handles.
  try {
    await signIn("credentials", {
      phone,
      pin: parsed.data.pin,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      // Includes `MissingSecret`: the account row exists but Auth.js cannot
      // mint a session, so signing in again will fail the same way until the
      // server configuration is fixed. The type makes that visible in logs.
      console.error(`[registerUser] account created but sign-in failed (${err.type}):`, err);
      return { error: tErrors("accountCreatedSignInFailed") };
    }
    // Let Next.js process the successful redirect and surface unexpected errors.
    throw err;
  }
}
