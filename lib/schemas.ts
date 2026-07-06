import { z } from "zod";
import { isValidRwandanPhone } from "@/lib/phone";
import { toCents } from "@/lib/money";

/** `t` is the `useTranslations("validation")` / `getTranslations("validation")` translator. */
type Translator = (key: string) => string;

function phoneField(t: Translator) {
  return z
    .string()
    .min(1, t("phoneRequired"))
    .refine(isValidRwandanPhone, { message: t("phoneInvalid") });
}

export function createRegisterSchema(t: Translator) {
  return z
    .object({
      name: z.string().trim().min(2, t("nameTooShort")),
      phone: phoneField(t),
      nationalId: z
        .string()
        .trim()
        .refine((v) => v === "" || /^\d{16}$/.test(v), {
          message: t("nationalIdInvalid"),
        }),
      pin: z.string().regex(/^\d{5}$/, t("pinInvalid")),
      confirmPin: z.string(),
    })
    .refine((data) => data.pin === data.confirmPin, {
      path: ["confirmPin"],
      message: t("pinMismatch"),
    });
}

export type RegisterValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export function createLoginSchema(t: Translator) {
  return z.object({
    phone: phoneField(t),
    pin: z.string().regex(/^\d{5}$/, t("pinInvalid")),
  });
}

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * Group form keeps every field as a string (what HTML inputs produce);
 * the server action converts to cents / basis points / Date after parsing.
 */
export function createGroupFormSchema(t: Translator) {
  return z
    .object({
      name: z.string().trim().min(3, t("groupNameTooShort")),
      contributionAmount: z.string().refine(
        (v) => {
          try {
            return toCents(v) > 0;
          } catch {
            return false;
          }
        },
        { message: t("amountInvalid") },
      ),
      meetingDay: z.string().regex(/^[0-6]$/, t("meetingDayRequired")),
      interestRate: z.string().refine(
        (v) => {
          const n = Number(v);
          return Number.isFinite(n) && n >= 0 && n <= 100;
        },
        { message: t("interestRange") },
      ),
      cycleStart: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
        message: t("dateRequired"),
      }),
      cycleEnd: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
        message: t("dateRequired"),
      }),
    })
    .refine((data) => Date.parse(data.cycleEnd) > Date.parse(data.cycleStart), {
      path: ["cycleEnd"],
      message: t("endDateAfterStart"),
    });
}

export type GroupFormValues = z.infer<ReturnType<typeof createGroupFormSchema>>;

/** Loan request form — amount stays a string; the action converts to cents. */
export function createLoanRequestSchema(t: Translator) {
  return z.object({
    amount: z.string().refine(
      (v) => {
        try {
          return toCents(v) > 0;
        } catch {
          return false;
        }
      },
      { message: t("amountInvalid") },
    ),
    purpose: z.string().trim().min(5, t("purposeTooShort")).max(200, t("purposeTooLong")),
    dueDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: t("dateRequired"),
    }),
    guarantorId: z.string(),
  });
}

export type LoanRequestValues = z.infer<ReturnType<typeof createLoanRequestSchema>>;

export function createRejectLoanSchema(t: Translator) {
  return z.object({
    reason: z.string().trim().min(5, t("rejectionReasonTooShort")),
  });
}

export type RejectLoanValues = z.infer<ReturnType<typeof createRejectLoanSchema>>;

/** Record-payment form — amount stays a string; the action converts to cents. */
export function createRecordPaymentSchema(t: Translator) {
  return z.object({
    amount: z.string().refine(
      (v) => {
        try {
          return toCents(v) > 0;
        } catch {
          return false;
        }
      },
      { message: t("amountInvalid") },
    ),
    paidAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: t("dateRequired"),
    }),
    note: z.string(),
  });
}

export type RecordPaymentValues = z.infer<ReturnType<typeof createRecordPaymentSchema>>;

export function createGroupPoliciesSchema(t: Translator) {
  return z.object({
    maxLoanMultiplier: z.string().refine(
      (v) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= 100 && n <= 500;
      },
      { message: t("multiplierRange") },
    ),
    maxLoanDurationDays: z.string().refine(
      (v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 30 && n <= 365;
      },
      { message: t("durationRange") },
    ),
    requireGuarantor: z.boolean(),
    requireApproval: z.boolean(),
  });
}

export type GroupPoliciesValues = z.infer<ReturnType<typeof createGroupPoliciesSchema>>;
