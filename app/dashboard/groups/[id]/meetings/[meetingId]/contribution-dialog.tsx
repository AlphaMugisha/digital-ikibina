"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { fromCents } from "@/lib/money";
import { recordContribution } from "./actions";

export type ContributionTarget = {
  membershipId: string;
  name: string;
  amountCents: number;
  note: string;
};

/** Owns the editable fields; remounted (via `key`) whenever a different member is tapped. */
function ContributionForm({
  meetingId,
  target,
  onOpenChange,
  onSaved,
}: {
  meetingId: string;
  target: ContributionTarget;
  onOpenChange: (open: boolean) => void;
  onSaved: (membershipId: string, amountCents: number) => void;
}) {
  const t = useTranslations("meetings");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(
    target.amountCents > 0 ? String(fromCents(target.amountCents)) : "",
  );
  const [note, setNote] = useState(target.note);

  function handleSave() {
    startTransition(async () => {
      const result = await recordContribution(meetingId, target.membershipId, amount, note);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("recordSaved"));
      onSaved(target.membershipId, result.data.amountCents);
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="space-y-5 px-4 md:px-0">
        <div className="space-y-2">
          <Label htmlFor="contribution-amount">{t("amountLabel")}</Label>
          <div className="relative">
            <Input
              id="contribution-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 rounded-xl pr-14 text-base"
              type="text"
              inputMode="numeric"
              autoFocus
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
              RWF
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contribution-note">
            {t("noteLabel")} ({tCommon("optional")})
          </Label>
          <Textarea
            id="contribution-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-20 rounded-xl text-base"
          />
        </div>
      </div>
      <div className="mt-4 px-4 md:px-0">
        <Button
          type="button"
          className="h-12 w-full rounded-full text-base md:w-auto"
          disabled={isPending}
          onClick={handleSave}
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {tCommon("save")}
        </Button>
      </div>
    </>
  );
}

export function ContributionDialog({
  meetingId,
  target,
  onOpenChange,
  onSaved,
}: {
  meetingId: string;
  target: ContributionTarget | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (membershipId: string, amountCents: number) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations("meetings");
  const open = target !== null;
  const title = target ? t("recordFor", { name: target.name }) : "";

  const form = target && (
    <ContributionForm
      key={target.membershipId}
      meetingId={meetingId}
      target={target}
      onOpenChange={onOpenChange}
      onSaved={onSaved}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {form}
      </SheetContent>
    </Sheet>
  );
}
