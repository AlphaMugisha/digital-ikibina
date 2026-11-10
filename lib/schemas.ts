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
      minContributionAmount: z.string().refine(
        (v) => {
          try {
            return toCents(v) > 0;
          } catch {
            return false;
          }
        },
        { message: t("amountInvalid") },
      ),
      maxContributionAmount: z.string().refine(
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
    })
    .refine(
      (data) => {
        try {
          return toCents(data.maxContributionAmount) >= toCents(data.minContributionAmount);
        } catch {
          return false;
        }
      },
      { path: ["maxContributionAmount"], message: t("maxBelowMin") },
    );
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
  return z
    .object({
      minContributionAmount: z.string().refine(
        (v) => {
          try {
            return toCents(v) > 0;
          } catch {
            return false;
          }
        },
        { message: t("amountInvalid") },
      ),
      maxContributionAmount: z.string().refine(
        (v) => {
          try {
            return toCents(v) > 0;
          } catch {
            return false;
          }
        },
        { message: t("amountInvalid") },
      ),
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
    })
    .refine(
      (data) => {
        try {
          return toCents(data.maxContributionAmount) >= toCents(data.minContributionAmount);
        } catch {
          return false;
        }
      },
      { path: ["maxContributionAmount"], message: t("maxBelowMin") },
    );
}

export type GroupPoliciesValues = z.infer<ReturnType<typeof createGroupPoliciesSchema>>;

export function createCancelShareOutSchema(t: Translator) {
  return z.object({
    reason: z.string().trim().min(5, t("rejectionReasonTooShort")),
  });
}

export type CancelShareOutValues = z.infer<ReturnType<typeof createCancelShareOutSchema>>;

/** New-cycle dates form for completing a share-out — same shape/rules as the group cycle fields. */
export function createCompleteShareOutSchema(t: Translator) {
  return z
    .object({
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

export type CompleteShareOutValues = z.infer<ReturnType<typeof createCompleteShareOutSchema>>;

export function createConstitutionRulesSchema(t: Translator) {
  return z.object({
    latenessGraceDays: z.string().refine(
      (v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 0 && n <= 90;
      },
      { message: t("graceDaysRange") },
    ),
    lateFeeType: z.enum(["NONE", "FIXED", "PERCENT"]),
    lateFeeAmount: z.string().refine(
      (v) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0;
      },
      { message: t("amountInvalid") },
    ),
    absenceFineAmount: z.string().refine(
      (v) => {
        try {
          return toCents(v) >= 0;
        } catch {
          return false;
        }
      },
      { message: t("amountInvalid") },
    ),
  });
}

export type ConstitutionRulesValues = z.infer<ReturnType<typeof createConstitutionRulesSchema>>;

/**
 * Profile — the only member-editable fields. `phone` is deliberately absent:
 * it is the login credential, so changing it is a leader/support action, not
 * self-service. `nationalId` is absent for the same reason (identity data a
 * leader verifies).
 */
export function createProfileSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(2, t("nameTooShort")),
    preferredLocale: z.enum(["rw", "en", "fr"]),
  });
}

export type ProfileValues = z.infer<ReturnType<typeof createProfileSchema>>;

/** Changing a PIN always requires proving possession of the current one. */
export function createChangePinSchema(t: Translator) {
  return z
    .object({
      currentPin: z.string().regex(/^\d{5}$/, t("pinInvalid")),
      newPin: z.string().regex(/^\d{5}$/, t("pinInvalid")),
      confirmPin: z.string(),
    })
    .refine((data) => data.newPin === data.confirmPin, {
      path: ["confirmPin"],
      message: t("pinMismatch"),
    })
    .refine((data) => data.newPin !== data.currentPin, {
      path: ["newPin"],
      message: t("pinSameAsOld"),
    });
}

export type ChangePinValues = z.infer<ReturnType<typeof createChangePinSchema>>;
