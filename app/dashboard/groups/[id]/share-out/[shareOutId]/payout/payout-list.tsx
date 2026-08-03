"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { AllocationStatus, ShareOutStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AllocationStatusBadge } from "@/components/shareout/shareout-status-badge";
import { formatRWF } from "@/lib/money";
import { markAllocationPaid, markAllAllocationsPaid, completeShareOut } from "./actions";

type AllocationRow = {
  id: string;
  name: string;
  finalPayout: number;
  status: AllocationStatus;
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function PayoutList({
  shareOutId,
  groupId,
  status,
  previousCycleDays,
  previousCycleEnd,
  allocations,
  locale,
}: {
  shareOutId: string;
  groupId: string;
  status: ShareOutStatus;
  previousCycleDays: number;
  previousCycleEnd: string;
  allocations: AllocationRow[];
  locale: string;
}) {
  const [rows, setRows] = useState(allocations);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [newCycleStart, setNewCycleStart] = useState(() => addDays(previousCycleEnd, 1));
  const [newCycleEnd, setNewCycleEnd] = useState(() => addDays(previousCycleEnd, 1 + previousCycleDays));
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("shareout");
  const tCommon = useTranslations("common");

  const allSettled = rows.every((r) => r.status === "PAID" || r.status === "WAIVED");
  const canAct = status === "FINALIZED";

  function handleMarkPaid(allocationId: string) {
    startTransition(async () => {
      const result = await markAllocationPaid(allocationId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.id === allocationId ? { ...r, status: "PAID" as AllocationStatus } : r)),
      );
      toast.success(t("allocationMarkedPaid"));
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      const result = await markAllAllocationsPaid(shareOutId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRows((prev) => prev.map((r) => (r.status === "PENDING" ? { ...r, status: "PAID" } : r)));
      toast.success(t("allAllocationsMarkedPaid"));
    });
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await completeShareOut(shareOutId, newCycleStart, newCycleEnd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("cycleCompleted", { number: result.data.cycleNumber }));
      setCompleteOpen(false);
      router.push(`/dashboard/groups/${groupId}`);
    });
  }

  const pendingCount = useMemo(() => rows.filter((r) => r.status === "PENDING").length, [rows]);

  return (
    <div className="space-y-4">
      {canAct && pendingCount > 0 && (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-full sm:w-auto"
          disabled={isPending}
          onClick={handleMarkAll}
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("markAllPaid")}
        </Button>
      )}

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
              <p className="text-sm font-semibold text-primary">{formatRWF(row.finalPayout, locale)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AllocationStatusBadge status={row.status} />
              {canAct && row.status === "PENDING" && (
                <Button
                  type="button"
                  size="sm"
                  className="h-9 rounded-full"
                  disabled={isPending}
                  onClick={() => handleMarkPaid(row.id)}
                >
                  {t("markAsPaid")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {canAct && allSettled && (
        <div className="rounded-2xl border border-border bg-primary/5 p-4">
          <p className="text-sm text-foreground">{t("promptCompleteCycle")}</p>
          <Button
            type="button"
            className="mt-3 h-11 w-full rounded-full sm:w-auto"
            onClick={() => setCompleteOpen(true)}
          >
            {t("completeCycleTitle")}
          </Button>
        </div>
      )}

      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("completeCycleTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-cycle-start">{t("newCycleStartLabel")}</Label>
              <Input
                id="new-cycle-start"
                type="date"
                value={newCycleStart}
                onChange={(e) => setNewCycleStart(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-cycle-end">{t("newCycleEndLabel")}</Label>
              <Input
                id="new-cycle-end"
                type="date"
                value={newCycleEnd}
                onChange={(e) => setNewCycleEnd(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>
          </div>
          <Button
            type="button"
            className="h-12 w-full rounded-full text-base"
            disabled={isPending}
            onClick={handleComplete}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("completeConfirm")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full rounded-full"
            onClick={() => setCompleteOpen(false)}
          >
            {tCommon("cancel")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
