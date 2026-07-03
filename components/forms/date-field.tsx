"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Date picker whose value is still the plain "yyyy-MM-dd" string the form/schema expects. */
export function DateField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 w-full justify-start rounded-xl text-left text-base font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" aria-hidden="true" />
          {selected ? format(selected, "d MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => date && onChange(format(date, "yyyy-MM-dd"))}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
