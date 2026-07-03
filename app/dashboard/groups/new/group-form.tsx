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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MEETING_DAYS } from "@/lib/days";
import { groupFormSchema, type GroupFormValues } from "@/lib/schemas";
import { createGroup } from "./actions";

export function GroupForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Izina ry&apos;itsinda / Group name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-12 text-base"
                  placeholder="Abisunganye"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contributionAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Umusanzu wa buri cyumweru (RWF) / Weekly contribution
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-12 text-base"
                  type="text"
                  inputMode="numeric"
                  placeholder="2000"
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
              <FormLabel>Umunsi w&apos;inama / Meeting day</FormLabel>
              <FormControl>
                {/* Native select: opens the platform picker on mobile */}
                <select
                  {...field}
                  className="border-input h-12 w-full rounded-md border bg-transparent px-3 text-base shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {MEETING_DAYS.map((day) => (
                    <option key={day.value} value={String(day.value)}>
                      {day.rw} / {day.en}
                    </option>
                  ))}
                </select>
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
              <FormLabel>
                Inyungu ku nguzanyo (%) / Loan interest rate
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-12 text-base"
                  type="text"
                  inputMode="decimal"
                  placeholder="5"
                />
              </FormControl>
              <FormDescription>
                Urugero: 5 bisobanura 5% ku nguzanyo / e.g. 5 means 5% per loan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="cycleStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gutangira / Cycle start</FormLabel>
                <FormControl>
                  <Input {...field} className="h-12 text-base" type="date" />
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
                <FormLabel>Kurangiza / Cycle end</FormLabel>
                <FormControl>
                  <Input {...field} className="h-12 text-base" type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="h-12 w-full text-base"
          disabled={isPending}
        >
          {isPending && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          Kora itsinda / Create group
        </Button>
      </form>
    </Form>
  );
}
