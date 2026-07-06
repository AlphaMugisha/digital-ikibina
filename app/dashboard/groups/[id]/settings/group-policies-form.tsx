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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createGroupPoliciesSchema, type GroupPoliciesValues } from "@/lib/schemas";
import { updateGroupPolicies } from "./actions";

export function GroupPoliciesForm({
  groupId,
  defaultValues,
}: {
  groupId: string;
  defaultValues: GroupPoliciesValues;
}) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("loans");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");

  const schema = useMemo(() => createGroupPoliciesSchema(tValidation), [tValidation]);

  const form = useForm<GroupPoliciesValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function onSubmit(values: GroupPoliciesValues) {
    startTransition(async () => {
      const result = await updateGroupPolicies(groupId, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("policiesSaved"));
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24 md:pb-0">
        <FormField
          control={form.control}
          name="maxLoanMultiplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maxMultiplierLabel")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    className="h-12 rounded-xl pr-10 text-base"
                    type="text"
                    inputMode="numeric"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                    %
                  </span>
                </div>
              </FormControl>
              <FormDescription>{t("maxMultiplierHint")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxLoanDurationDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maxDurationLabel")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-12 rounded-xl text-base"
                  type="text"
                  inputMode="numeric"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="requireGuarantor"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4">
              <div>
                <FormLabel>{t("requireGuarantorLabel")}</FormLabel>
                <FormDescription>{t("requireGuarantorHint")}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requireApproval"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4">
              <div>
                <FormLabel>{t("requireApprovalLabel")}</FormLabel>
                <FormDescription>{t("requireApprovalHint")}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Sticky on mobile (clears the floating bottom nav) so it's always reachable */}
        <div className="fixed inset-x-4 bottom-24 z-30 md:static md:inset-auto md:flex md:justify-end">
          <Button
            type="submit"
            className="h-14 w-full rounded-full text-base shadow-warm-lg md:h-11 md:w-auto md:shadow-none"
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tCommon("save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
