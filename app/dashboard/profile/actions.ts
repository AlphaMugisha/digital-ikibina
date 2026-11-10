"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isDatabaseUnreachable } from "@/lib/auth-errors";
import { setUserLocale } from "@/i18n/locale";
import {
  createChangePinSchema,
  createProfileSchema,
  type ChangePinValues,
  type ProfileValues,
} from "@/lib/schemas";

type ActionResult = { error: string } | { ok: true };

/**
 * Update the member's own name and preferred language.
 *
 * The user id comes from the session, never from the client, so this cannot be
 * pointed at another member's record. Fields the member may not edit (phone,
 * nationalId) are absent from the schema, so even a crafted payload cannot
 * reach them.
 */
export async function updateProfile(values: ProfileValues): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    const tErrors = await getTranslations("errors");
    return { error: tErrors("notAuthorized") };
  }

  const [tValidation, tErrors] = await Promise.all([
    getTranslations("validation"),
    getTranslations("errors"),
  ]);

  const parsed = createProfileSchema(tValidation).safeParse(values);
  if (!parsed.success) {
    return { error: tErrors("formInvalid") };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        preferredLocale: parsed.data.preferredLocale,
      },
    });
  } catch (err) {
    console.error("[updateProfile] DB error:", err);
    return {
      error: tErrors(isDatabaseUnreachable(err) ? "databaseUnreachable" : "unexpectedError"),
    };
  }

  // Keep the cookie in step with the saved preference, otherwise the UI would
  // still render in the old language until the next sign-in.
  await setUserLocale(parsed.data.preferredLocale);

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Change the member's PIN.
 *
 * Holding a session is not enough: the current PIN is re-verified against
 * `pinHash` first, so a borrowed phone with an open session cannot be used to
 * lock the real owner out.
 */
export async function changePin(values: ChangePinValues): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    const tErrors = await getTranslations("errors");
    return { error: tErrors("notAuthorized") };
  }

  const [tValidation, tErrors, tProfile] = await Promise.all([
    getTranslations("validation"),
    getTranslations("errors"),
    getTranslations("profile"),
  ]);

  const parsed = createChangePinSchema(tValidation).safeParse(values);
  if (!parsed.success) {
    return { error: tErrors("formInvalid") };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { pinHash: true },
    });
    if (!user) return { error: tErrors("notAuthorized") };

    const currentMatches = await bcrypt.compare(parsed.data.currentPin, user.pinHash);
    if (!currentMatches) {
      return { error: tProfile("pinIncorrect") };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { pinHash: await bcrypt.hash(parsed.data.newPin, 10) },
    });
  } catch (err) {
    console.error("[changePin] DB error:", err);
    return {
      error: tErrors(isDatabaseUnreachable(err) ? "databaseUnreachable" : "unexpectedError"),
    };
  }

  return { ok: true };
}
