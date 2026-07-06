"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { disburseLoan } from "./actions";

export function DisburseButton({ loanId }: { loanId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("loans");

  function handleClick() {
    startTransition(async () => {
      const result = await disburseLoan(loanId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("loanDisbursed"));
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      className="h-11 w-full rounded-full"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {t("markDisbursed")}
    </Button>
  );
}
