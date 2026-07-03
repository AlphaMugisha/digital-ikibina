"use client";

import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DayPickerPills } from "@/components/forms/day-picker-pills";
import { DateField } from "@/components/forms/date-field";
import { createGroupFormSchema, type GroupFormValues } from "@/lib/schemas";
import { createGroup } from "./actions";

export function GroupForm() {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("groups");
  const tValidation = useTranslations("validation");

  const schema = useMemo(
    () => createGroupFormSchema(tValidation),
    [tValidation],
  );

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      contributionAmount: "",
      meetingDay: "6",
      interestRate: "5",
      cycleStart: "",
      cycleEnd: "",
    },
  });

  function onSubmit(values: GroupFormValues) {
    startTransition(async () => {
      const result = await createGroup(values);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-24 md:pb-0">
        <section className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t("sectionDetails")}
          </p>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("nameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-12 rounded-xl text-base"
                    placeholder={t("namePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meetingDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("meetingDayLabel")}</FormLabel>
                <FormControl>
                  <DayPickerPills value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        <section className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t("sectionMoney")}
          </p>
          <FormField
            control={form.control}
            name="contributionAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contributionLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      className="h-12 rounded-xl pr-14 text-base"
                      type="text"
                      inputMode="numeric"
                      placeholder="2000"
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
            name="interestRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("interestLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      className="h-12 rounded-xl pr-10 text-base"
                      type="text"
                      inputMode="decimal"
                      placeholder="5"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                      %
                    </span>
                  </div>
                </FormControl>
                <FormDescription>{t("interestHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        <section className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t("sectionCycle")}
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="cycleStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cycleStartLabel")}</FormLabel>
                  <FormControl>
                    <DateField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("datePlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cycleEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cycleEndLabel")}</FormLabel>
                  <FormControl>
                    <DateField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("datePlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Sticky on mobile (clears the floating bottom nav) so it's always reachable */}
        <div className="fixed inset-x-4 bottom-24 z-30 md:static md:inset-auto">
          <Button
            type="submit"
            className="h-14 w-full rounded-full text-base shadow-warm-lg md:shadow-none"
            disabled={isPending}
          >
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("submitCreate")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
