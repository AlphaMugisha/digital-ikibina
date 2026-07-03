"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { endMeeting } from "./actions";

export function EndMeetingButton({
  meetingId,
  groupId,
}: {
  meetingId: string;
  groupId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("meetings");

  function handleClick() {
    startTransition(async () => {
      const result = await endMeeting(meetingId, "");
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("meetingEnded"));
      router.push(`/dashboard/groups/${groupId}/meetings`);
    });
  }

  return (
    <Button
      type="button"
      className="h-11 shrink-0 rounded-full"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {t("endMeeting")}
    </Button>
  );
}
