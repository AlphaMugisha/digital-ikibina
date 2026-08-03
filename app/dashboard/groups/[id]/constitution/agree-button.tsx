"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { agreeToConstitution } from "./actions";

export function AgreeButton({ groupId, version }: { groupId: string; version: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("constitution");

  function handleClick() {
    startTransition(async () => {
      const result = await agreeToConstitution(groupId, version);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("agreedNotice"));
      router.refresh();
    });
  }

  return (
    <Button type="button" className="h-11 w-full rounded-full sm:w-auto" disabled={isPending} onClick={handleClick}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Check className="size-4" aria-hidden="true" />
      )}
      {t("agree")}
    </Button>
  );
}
