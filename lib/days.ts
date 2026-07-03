// 2023-01-01 (UTC) was a Sunday — used as a stable anchor so we can derive a
// weekday name for any Group.meetingDay (0 = Sunday … 6 = Saturday) purely
// from Intl, without needing per-locale weekday tables of our own.
const REFERENCE_SUNDAY_UTC = Date.UTC(2023, 0, 1);

export function meetingDayLabel(
  day: number,
  locale: string,
  format: "long" | "short" = "long",
): string {
  const date = new Date(REFERENCE_SUNDAY_UTC + day * 86_400_000);
  return new Intl.DateTimeFormat(locale, {
    weekday: format,
    timeZone: "UTC",
  }).format(date);
}

export function weekdays(
  locale: string,
  format: "long" | "short" = "long",
): { value: number; label: string }[] {
  return Array.from({ length: 7 }, (_, day) => ({
    value: day,
    label: meetingDayLabel(day, locale, format),
  }));
}
