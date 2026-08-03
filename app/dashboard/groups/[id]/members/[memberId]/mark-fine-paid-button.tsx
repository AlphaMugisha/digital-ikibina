"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { markFinePaid } from "../fine-actions";

export function MarkFinePaidButton({ attendanceId }: { attendanceId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("fines");

  function handleClick() {
    startTransition(async () => {
      const result = await markFinePaid(attendanceId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("markedPaid"));
      router.refresh();
    });
  }

  return (
    <Button type="button" size="sm" className="h-8 rounded-full" disabled={isPending} onClick={handleClick}>
      {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {t("markPaid")}
    </Button>
  );
}
