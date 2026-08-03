"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { initiateShareOut } from "./actions";

export function StartShareOutButton({
  groupId,
  disabled,
}: {
  groupId: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("shareout");

  function handleClick() {
    startTransition(async () => {
      const result = await initiateShareOut(groupId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("shareOutInitiated"));
      router.push(`/dashboard/groups/${groupId}/share-out/${result.data.shareOutId}`);
    });
  }

  return (
    <Button
      type="button"
      className="h-11 w-full rounded-full sm:w-auto"
      disabled={isPending || disabled}
      onClick={handleClick}
    >
      {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {t("startShareOut")}
    </Button>
  );
}
