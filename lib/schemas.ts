import { z } from "zod";
import { isValidRwandanPhone } from "@/lib/phone";
import { toCents } from "@/lib/money";

const phoneField = z
  .string()
  .min(1, "Andika numero ya telefoni / Phone number is required")
  .refine(isValidRwandanPhone, {
    message:
      "Numero ntiyemewe. Koresha 07XXXXXXXX cyangwa +2507XXXXXXXX / Invalid Rwandan phone number",
  });

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Izina rigomba kugira inyuguti 2 byibuze / Name must be at least 2 characters"),
    phone: phoneField,
    nationalId: z
      .string()
      .trim()
      .refine((v) => v === "" || /^\d{16}$/.test(v), {
        message:
          "Indangamuntu igomba kuba imibare 16 / National ID must be 16 digits",
      }),
    pin: z
      .string()
      .regex(/^\d{5}$/, "PIN igomba kuba imibare 5 / PIN must be exactly 5 digits"),
    confirmPin: z.string(),
  })
  .refine((data) => data.pin === data.confirmPin, {
    path: ["confirmPin"],
    message: "PIN ntizihura / PINs do not match",
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  phone: phoneField,
  pin: z
    .string()
    .regex(/^\d{5}$/, "PIN igomba kuba imibare 5 / PIN must be exactly 5 digits"),
});

export type LoginValues = z.infer<typeof loginSchema>;

/**
 * Group form keeps every field as a string (what HTML inputs produce);
 * the server action converts to cents / basis points / Date after parsing.
 */
export const groupFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Izina rigomba kugira inyuguti 3 byibuze / Name must be at least 3 characters"),
    contributionAmount: z.string().refine(
      (v) => {
        try {
          return toCents(v) > 0;
        } catch {
          return false;
        }
      },
      { message: "Andika umubare w'amafaranga wemewe / Enter a valid amount in RWF" },
    ),
    meetingDay: z
      .string()
      .regex(/^[0-6]$/, "Hitamo umunsi w'inama / Choose a meeting day"),
    interestRate: z.string().refine(
      (v) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 && n <= 100;
      },
      { message: "Inyungu igomba kuba hagati ya 0 na 100 / Interest must be between 0 and 100" },
    ),
    cycleStart: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), {
        message: "Hitamo itariki yo gutangira / Choose a start date",
      }),
    cycleEnd: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), {
        message: "Hitamo itariki yo kurangiza / Choose an end date",
      }),
  })
  .refine((data) => Date.parse(data.cycleEnd) > Date.parse(data.cycleStart), {
    path: ["cycleEnd"],
    message:
      "Itariki yo kurangiza igomba kuza nyuma y'iyo gutangira / End date must be after start date",
  });

export type GroupFormValues = z.infer<typeof groupFormSchema>;
