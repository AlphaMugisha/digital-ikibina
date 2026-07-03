export const locales = ["rw", "en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "rw";

export const localeNames: Record<Locale, string> = {
  rw: "Kinyarwanda",
  en: "English",
  fr: "Français",
};

export const localeFlags: Record<Locale, string> = {
  rw: "🇷🇼",
  en: "🇬🇧",
  fr: "🇫🇷",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
