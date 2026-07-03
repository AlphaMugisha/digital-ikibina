"use server";

import bcrypt from "bcryptjs";
import { getTranslations } from "next-intl/server";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeRwandanPhone } from "@/lib/phone";
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

  const existing = await prisma.user.findUnique({ where: { phone } });
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
  } catch {
    // Unique-constraint race on phone/nationalId or connection issue —
    // never leak Prisma internals to the user.
    return { error: tErrors("registrationFailed") };
  }

  // Sign in with the same credentials and land on the dashboard.
  // On success this throws NEXT_REDIRECT, which Next.js handles.
  await signIn("credentials", {
    phone,
    pin: parsed.data.pin,
    redirectTo: "/dashboard",
  });
}
