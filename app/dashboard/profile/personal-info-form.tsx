"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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
import { localeFlags, localeNames, locales, type Locale } from "@/i18n/config";
import { createProfileSchema, type ProfileValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { updateProfile } from "./actions";

/**
 * Language picker — a segmented pill group rather than a dropdown, since there
 * are only three options. Follows `components/forms/day-picker-pills.tsx` for
 * both styling and radiogroup semantics.
 */
function LocalePills({
  value,
  onChange,
  disabled,
}: {
  value: Locale;
  onChange: (next: Locale) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {locales.map((code) => {
        const selected = value === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(code)}
            className={cn(
              "flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-secondary",
            )}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {localeFlags[code]}
            </span>
            <span>{localeNames[code]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PersonalInfoForm({
  defaultValues,
}: {
  defaultValues: ProfileValues;
}) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");

  const schema = useMemo(() => createProfileSchema(tValidation), [tValidation]);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const isDirty = form.formState.isDirty;

  // Warn before losing edits on a reload or a tab close. In-app navigation is
  // Next.js's own concern; this covers the browser-level exits.
  useEffect(() => {
    if (!isDirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  function onSubmit(values: ProfileValues) {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      // Re-baseline so the form is no longer dirty and Save disables again.
      form.reset(values);
      toast.success(t("savedSuccess"));
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fullName")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-12 max-w-sm rounded-xl text-base"
                  autoComplete="name"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredLocale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("languageLabel")}</FormLabel>
              <FormControl>
                <LocalePills
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4 border-t border-border pt-5">
          <Button
            type="submit"
            disabled={isPending || !isDirty}
            className="h-11 rounded-full px-6"
          >
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("saveChanges")}
          </Button>
          {isDirty && !isPending && (
            <>
              <p className="text-sm text-muted-foreground">{t("unsavedWarning")}</p>
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-full px-4 text-muted-foreground"
                onClick={() => form.reset(defaultValues)}
              >
                {tCommon("cancel")}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
