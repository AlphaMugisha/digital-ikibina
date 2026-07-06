"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateField } from "@/components/forms/date-field";
import { createLoanRequestSchema, type LoanRequestValues } from "@/lib/schemas";
import { toCents, formatRWF } from "@/lib/money";
import { calculateInterest } from "@/lib/loans";
import { requestLoan } from "./actions";

const MS_PER_DAY = 86_400_000;

export function LoanRequestForm({
  groupId,
  interestRateBasisPoints,
  maxLoanDurationDays,
  requireGuarantor,
  otherMembers,
}: {
  groupId: string;
  interestRateBasisPoints: number;
  maxLoanDurationDays: number;
  requireGuarantor: boolean;
  otherMembers: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("loans");
  const tValidation = useTranslations("validation");

  // Snapshot "now" once at mount — Date.now() itself is impure and must not
  // be called directly during render (React purity rule).
  const [nowMs] = useState(() => Date.now());

  const schema = useMemo(() => createLoanRequestSchema(tValidation), [tValidation]);

  const defaultDueDate = useMemo(
    () =>
      new Date(nowMs + Math.min(30, maxLoanDurationDays) * MS_PER_DAY)
        .toISOString()
        .slice(0, 10),
    [nowMs, maxLoanDurationDays],
  );

  const form = useForm<LoanRequestValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      purpose: "",
      dueDate: defaultDueDate,
      guarantorId: "",
    },
  });

  const amount = useWatch({ control: form.control, name: "amount" });
  const dueDate = useWatch({ control: form.control, name: "dueDate" });

  const preview = useMemo(() => {
    let principal = 0;
    try {
      principal = toCents(amount || "0");
    } catch {
      return null;
    }
    if (principal <= 0) return null;

    const days = Math.max(0, Math.round((Date.parse(dueDate) - nowMs) / MS_PER_DAY));
    const interest = calculateInterest(principal, interestRateBasisPoints, days);
    return { principal, interest, total: principal + interest };
  }, [amount, dueDate, interestRateBasisPoints, nowMs]);

  function onSubmit(values: LoanRequestValues) {
    startTransition(async () => {
      const result = await requestLoan(
        groupId,
        values.amount,
        values.purpose,
        values.dueDate,
        values.guarantorId,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("requestSaved"));
      router.push(`/dashboard/groups/${groupId}/loans/${result.data.loanId}`);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("amountLabel")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    className="h-12 rounded-xl pr-14 text-base"
                    type="text"
                    inputMode="numeric"
                    placeholder="20000"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                    RWF
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("purposeLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-20 rounded-xl text-base"
                  placeholder={t("purposePlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("dueDateLabel")}</FormLabel>
              <FormControl>
                <DateField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("dueDateLabel")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guarantorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("guarantorLabel")} (
                {requireGuarantor ? t("guarantorRequiredHint") : t("guarantorOptionalHint")})
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="border-input h-12 w-full rounded-xl border bg-transparent px-3 text-base shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">{t("guarantorNone")}</option>
                  {otherMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {preview && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-4">
            <p className="text-sm font-medium text-foreground">
              {t("previewLabel")} {formatRWF(preview.total, locale)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("previewBreakdown", {
                principal: formatRWF(preview.principal, locale),
                interest: formatRWF(preview.interest, locale),
              })}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-full text-base"
          disabled={isPending}
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("submitRequest")}
        </Button>
      </form>
    </Form>
  );
}
