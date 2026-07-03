"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { registerSchema, type RegisterValues } from "@/lib/schemas";
import { registerUser } from "./actions";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
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
              <FormLabel>Amazina yawe / Full name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-12 rounded-xl text-base"
                  autoComplete="name"
                  placeholder="Mukamana Josiane"
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
              <FormLabel>Telefoni / Phone number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-12 rounded-xl text-base"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="078 123 4567"
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
                Indangamuntu (si itegeko) / National ID (optional)
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
              <FormLabel>PIN (imibare 5) / PIN (5 digits)</FormLabel>
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
              <FormLabel>Subiramo PIN / Confirm PIN</FormLabel>
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
          Iyandikishe / Create account
        </Button>
      </form>
    </Form>
  );
}
