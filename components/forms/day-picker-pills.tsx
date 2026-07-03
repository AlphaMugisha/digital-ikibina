"use client";

import { useLocale } from "next-intl";
import { weekdays } from "@/lib/days";
import { cn } from "@/lib/utils";

/** Horizontal pill selector — value stays the "0".."6" string the schema expects. */
export function DayPickerPills({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const locale = useLocale();
  const days = weekdays(locale, "short");

  return (
    <div
      role="radiogroup"
      className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
    >
      {days.map((day) => {
        const selected = value === String(day.value);
        return (
          <button
            key={day.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(String(day.value))}
            className={cn(
              "h-11 shrink-0 rounded-full border px-4 text-sm font-medium capitalize whitespace-nowrap transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-secondary",
            )}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
