import { defaultLocale } from "@/i18n/config";

/**
 * Money helpers — HARD RULE: all money in the database is INTEGER cents
 * (RWF × 100), never floats. Convert at the edges only:
 * form input → toCents() → DB, and DB → formatRWF()/fromCents() → display.
 */

/**
 * Convert a Rwandan-franc amount (form input) to integer cents for storage.
 * Accepts numbers or strings like "5000", "5,000", "5 000", "1500.50".
 * Throws on anything that isn't a finite, non-negative amount.
 */
export function toCents(rwf: number | string): number {
  const value =
    typeof rwf === "string" ? Number(rwf.replace(/[,\s]/g, "")) : rwf;

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid money amount: ${String(rwf)}`);
  }
  if (value < 0) {
    throw new Error(`Money amount cannot be negative: ${String(rwf)}`);
  }

  // Math.round guards against float artifacts (e.g. 1500.5 * 100 = 150049.999…)
  return Math.round(value * 100);
}

/**
 * Convert integer cents from the DB back to Rwandan francs as a number.
 * For display only — never store or do arithmetic with the result.
 */
export function fromCents(cents: number): number {
  if (!Number.isInteger(cents)) {
    throw new Error(`Cents must be an integer, got: ${String(cents)}`);
  }
  return cents / 100;
}

/**
 * Format integer cents as a localized RWF currency string, e.g. 500000 →
 * "5,000 RWF" (en), "5 000 RWF" (fr), "RF 5.000" (rw). RWF has no minor unit,
 * so it's shown with 0 decimals; fractional cents (rare — leftover interest
 * math) are shown with 2 decimals only when present.
 */
export function formatRWF(cents: number, locale: string = defaultLocale): string {
  const francs = fromCents(cents);
  const hasFraction = cents % 100 !== 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(francs);
}
