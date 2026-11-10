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

/**
 * Format a stored E.164 Rwandan number for display: "+250788123456" becomes
 * "+250 788 123 456". Anything that isn't a Rwandan E.164 number is returned
 * unchanged, so this is safe to call on whatever is in the database.
 */
export function formatRwandanPhone(e164: string): string {
  const match = /^\+250(7\d{2})(\d{3})(\d{3})$/.exec(e164.replace(/[\s-]/g, ""));
  if (!match) return e164;
  return `+250 ${match[1]} ${match[2]} ${match[3]}`;
}

/**
 * Mask a 16-digit national ID down to its last four digits for display:
 * "1199070123456789" becomes "•••• •••• •••• 6789". Returns null for a
 * missing ID so callers can show their own "not provided" copy.
 */
export function maskNationalId(nationalId: string | null): string | null {
  if (!nationalId) return null;
  const digits = nationalId.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `•••• •••• •••• ${digits.slice(-4)}`;
}
