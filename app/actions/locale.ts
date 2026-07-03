"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { setUserLocale } from "@/i18n/locale";
import { isLocale, type Locale } from "@/i18n/config";

export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;

  await setUserLocale(locale);

  const session = await auth();
  if (session?.user?.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredLocale: locale },
    });
  }
}

export type { Locale };
