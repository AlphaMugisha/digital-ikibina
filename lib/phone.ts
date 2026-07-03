/**
 * Rwandan mobile numbers: accept "+2507XXXXXXXX", "2507XXXXXXXX", or
 * "07XXXXXXXX" (with optional spaces/dashes) and normalize to E.164
 * ("+2507XXXXXXXX"). Everything is stored and looked up in E.164.
 */
export function normalizeRwandanPhone(input: string): string | null {
  const cleaned = input.replace(/[\s-]/g, "");

  if (/^\+2507\d{8}$/.test(cleaned)) return cleaned;
  if (/^2507\d{8}$/.test(cleaned)) return `+${cleaned}`;
  if (/^07\d{8}$/.test(cleaned)) return `+250${cleaned.slice(1)}`;

  return null;
}

export function isValidRwandanPhone(input: string): boolean {
  return normalizeRwandanPhone(input) !== null;
}
