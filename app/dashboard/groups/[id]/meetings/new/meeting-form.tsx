"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { DateField } from "@/components/forms/date-field";
import { createMeeting } from "../actions";

type FormValues = { date: string; notes: string };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MeetingForm({ groupId }: { groupId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("meetings");
  const tCommon = useTranslations("common");

  const form = useForm<FormValues>({
    defaultValues: { date: today(), notes: "" },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createMeeting(groupId, values.date, values.notes);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push(`/dashboard/groups/${groupId}/meetings/${result.data.meetingId}`);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("dateLabel")}</FormLabel>
              <FormControl>
                <DateField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("dateLabel")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("notesLabel")} ({tCommon("optional")})
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-24 rounded-xl text-base"
                  placeholder={t("notesPlaceholder")}
                />
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
          {t("startMeeting")}
        </Button>
      </form>
    </Form>
  );
}
