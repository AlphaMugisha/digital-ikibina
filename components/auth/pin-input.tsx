"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

/** 5-box PIN entry — same string value as a plain input, just friendlier on mobile. */
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
    <InputOTP
      maxLength={5}
      value={value}
      onChange={onChange}
      inputMode="numeric"
      autoFocus={autoFocus}
      containerClassName="justify-between sm:justify-start sm:gap-3"
    >
      <InputOTPGroup className="w-full justify-between sm:w-auto sm:justify-start sm:gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <InputOTPSlot
            key={i}
            index={i}
            className="h-12 w-[18%] rounded-xl border border-input text-lg font-semibold first:rounded-xl last:rounded-xl sm:h-14 sm:w-14 sm:text-xl"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
