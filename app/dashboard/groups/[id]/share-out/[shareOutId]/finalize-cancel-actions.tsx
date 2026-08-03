"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { finalizeShareOut, cancelShareOut } from "./actions";

export function FinalizeCancelActions({
  shareOutId,
  groupId,
}: {
  shareOutId: string;
  groupId: string;
}) {
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("shareout");
  const tCommon = useTranslations("common");

  function handleFinalize() {
    startTransition(async () => {
      const result = await finalizeShareOut(shareOutId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("shareOutFinalized"));
      setFinalizeOpen(false);
      router.refresh();
    });
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelShareOut(shareOutId, reason);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("shareOutCancelled"));
      setCancelOpen(false);
      setReason("");
      router.push(`/dashboard/groups/${groupId}/share-out`);
    });
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          type="button"
          className="h-11 flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPending}
          onClick={() => setFinalizeOpen(true)}
        >
          <Check className="size-4" aria-hidden="true" />
          {t("finalize")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
          disabled={isPending}
          onClick={() => setCancelOpen(true)}
        >
          <X className="size-4" aria-hidden="true" />
          {t("cancel")}
        </Button>
      </div>

      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("finalizeConfirmTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("finalizeConfirmBody")}</p>
          <Button
            type="button"
            className="h-12 w-full rounded-full text-base"
            disabled={isPending}
            onClick={handleFinalize}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("finalize")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full rounded-full"
            onClick={() => setFinalizeOpen(false)}
          >
            {tCommon("cancel")}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("cancelConfirmTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">{t("cancelReasonLabel")}</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-24 rounded-xl text-base"
              placeholder={t("cancelReasonPlaceholder")}
            />
          </div>
          <Button
            type="button"
            className="h-12 w-full rounded-full text-base"
            disabled={isPending || reason.trim().length < 5}
            onClick={handleCancel}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("cancelConfirm")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full rounded-full"
            onClick={() => setCancelOpen(false)}
          >
            {tCommon("cancel")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
