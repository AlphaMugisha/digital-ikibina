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
import { approveLoan, rejectLoan } from "./actions";

export function PendingLoanActions({ loanId }: { loanId: string }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("loans");
  const tCommon = useTranslations("common");

  function handleApprove() {
    startTransition(async () => {
      const result = await approveLoan(loanId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("loanApproved"));
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectLoan(loanId, reason);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("loanRejected"));
      setRejectOpen(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          type="button"
          className="h-11 flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPending}
          onClick={handleApprove}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          {t("approve")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
          disabled={isPending}
          onClick={() => setRejectOpen(true)}
        >
          <X className="size-4" aria-hidden="true" />
          {t("reject")}
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("rejectDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">{t("rejectReasonLabel")}</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-24 rounded-xl text-base"
              placeholder={t("rejectReasonPlaceholder")}
            />
          </div>
          <Button
            type="button"
            className="h-12 w-full rounded-full text-base"
            disabled={isPending || reason.trim().length < 5}
            onClick={handleReject}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("rejectConfirm")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full rounded-full"
            onClick={() => setRejectOpen(false)}
          >
            {tCommon("cancel")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
