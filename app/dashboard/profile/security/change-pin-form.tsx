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
import { PinInput } from "@/components/auth/pin-input";
import { createChangePinSchema, type ChangePinValues } from "@/lib/schemas";
import { changePin } from "../actions";

export function ChangePinForm() {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("profile");
  const tValidation = useTranslations("validation");

  const schema = useMemo(() => createChangePinSchema(tValidation), [tValidation]);

  const form = useForm<ChangePinValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPin: "", newPin: "", confirmPin: "" },
  });

  function onSubmit(values: ChangePinValues) {
    startTransition(async () => {
      const result = await changePin(values);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      form.reset({ currentPin: "", newPin: "", confirmPin: "" });
      toast.success(t("pinChanged"));
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("currentPin")}</FormLabel>
              <FormControl>
                <PinInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("newPin")}</FormLabel>
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
              <FormLabel>{t("confirmNewPin")}</FormLabel>
              <FormControl>
                <PinInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t border-border pt-5">
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 rounded-full px-6"
          >
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("changePinAction")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
