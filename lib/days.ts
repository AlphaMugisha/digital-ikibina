/** Meeting days, matching Group.meetingDay (0 = Sunday … 6 = Saturday). */
export const MEETING_DAYS = [
  { value: 0, rw: "Ku cyumweru", en: "Sunday" },
  { value: 1, rw: "Kuwa mbere", en: "Monday" },
  { value: 2, rw: "Kuwa kabiri", en: "Tuesday" },
  { value: 3, rw: "Kuwa gatatu", en: "Wednesday" },
  { value: 4, rw: "Kuwa kane", en: "Thursday" },
  { value: 5, rw: "Kuwa gatanu", en: "Friday" },
  { value: 6, rw: "Kuwa gatandatu", en: "Saturday" },
] as const;

export function meetingDayLabel(day: number): string {
  const found = MEETING_DAYS.find((d) => d.value === day);
  return found ? `${found.rw} / ${found.en}` : "—";
}
