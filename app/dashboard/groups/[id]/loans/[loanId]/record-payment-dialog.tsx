"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toCents, formatRWF } from "@/lib/money";
import { recordLoanPayment } from "./actions";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function RecordPaymentForm({
  loanId,
  totalOwed,
  onSaved,
}: {
  loanId: string;
  totalOwed: number;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(() => today());
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("loans");
  const tCommon = useTranslations("common");

  const preview = useMemo(() => {
    let cents = 0;
    try {
      cents = toCents(amount || "0");
    } catch {
      return null;
    }
    if (cents <= 0) return null;
    return Math.max(0, totalOwed - cents);
  }, [amount, totalOwed]);

  function handleSave() {
    startTransition(async () => {
      const result = await recordLoanPayment(loanId, amount, paidAt, note);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.data.isPaid ? t("loanPaidOff") : t("paymentSaved"));
      onSaved();
      router.refresh();
    });
  }

  return (
    <>
      <div className="space-y-5 px-4 md:px-0">
        <div className="space-y-2">
          <Label htmlFor="payment-amount">{t("amountLabel")}</Label>
          <div className="relative">
            <Input
              id="payment-amount"
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
          <Label htmlFor="payment-date">{t("paidAtLabel")}</Label>
          <Input
            id="payment-date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            className="h-12 rounded-xl text-base"
            type="date"
            max={today()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-note">
            {t("noteLabel")} ({tCommon("optional")})
          </Label>
          <Textarea
            id="payment-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-20 rounded-xl text-base"
          />
        </div>
        {preview !== null && (
          <p className="text-sm text-muted-foreground">
            {t("paymentPreview", { amount: formatRWF(preview, locale) })}
          </p>
        )}
      </div>
      <div className="mt-4 px-4 md:px-0">
        <Button
          type="button"
          className="h-12 w-full rounded-full text-base md:w-auto"
          disabled={isPending || !amount}
          onClick={handleSave}
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {tCommon("save")}
        </Button>
      </div>
    </>
  );
}

export function RecordPaymentDialog({
  loanId,
  totalOwed,
}: {
  loanId: string;
  totalOwed: number;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations("loans");

  const form = open && (
    <RecordPaymentForm loanId={loanId} totalOwed={totalOwed} onSaved={() => setOpen(false)} />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="h-11 w-full rounded-full sm:w-auto">{t("recordPayment")}</Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("recordPayment")}</DialogTitle>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="h-11 w-full rounded-full sm:w-auto">{t("recordPayment")}</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{t("recordPayment")}</SheetTitle>
        </SheetHeader>
        {form}
      </SheetContent>
    </Sheet>
  );
}
