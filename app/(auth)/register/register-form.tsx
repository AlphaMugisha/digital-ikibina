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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/auth/pin-input";
import { createRegisterSchema, type RegisterValues } from "@/lib/schemas";
import { registerUser } from "./actions";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");

  const schema = useMemo(
    () => createRegisterSchema(tValidation),
    [tValidation],
  );

  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      nationalId: "",
      pin: "",
      confirmPin: "",
    },
  });

  function onSubmit(values: RegisterValues) {
    startTransition(async () => {
      const result = await registerUser(values);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("phoneLabel")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-12 rounded-xl text-base"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={t("phonePlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nationalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("nationalIdLabel")} ({tCommon("optional")})
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-12 rounded-xl text-base"
                  type="tel"
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="1199..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("pinLabel")}</FormLabel>
              <FormControl>
                <PinInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("pinConfirmLabel")}</FormLabel>
              <FormControl>
                <PinInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="h-12 w-full rounded-full text-base"
          disabled={isPending}
        >
          {isPending && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          {t("createAccount")}
        </Button>
      </form>
    </Form>
  );
}
