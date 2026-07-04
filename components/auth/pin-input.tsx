"use client";

import { Input } from "@/components/ui/input";

/** Plain masked PIN field — 5 digits, hidden as you type like a normal password input. */
export function PinInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
      type="password"
      inputMode="numeric"
      autoComplete="off"
      maxLength={5}
      autoFocus={autoFocus}
      className="h-12 rounded-xl text-base tracking-widest"
    />
  );
}
