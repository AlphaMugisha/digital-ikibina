"use server";

import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";

const COOKIE_NAME = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function getUserLocale(): Promise<Locale> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return value && isLocale(value) ? value : defaultLocale;
}

export async function setUserLocale(locale: Locale): Promise<void> {
  (await cookies()).set(COOKIE_NAME, locale, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });
}
