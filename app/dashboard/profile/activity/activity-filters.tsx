"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEDGER_CATEGORIES, LEDGER_PERIODS } from "@/lib/profile-ledger";
import { cn } from "@/lib/utils";

type GroupOption = { id: string; name: string };

/**
 * Filters write to the URL rather than to client state, so the server does the
 * filtering, the back button works, and a filtered view can be shared.
 */
export function ActivityFilters({ groups }: { groups: GroupOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("profile");

  const period = params.get("period") ?? "12m";
  const category = params.get("category") ?? "all";
  const groupId = params.get("group") ?? "all";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all" || (key === "period" && value === "12m")) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    startTransition(() => {
      router.replace(next.size ? `?${next.toString()}` : "?", { scroll: false });
    });
  }

  const periodLabels: Record<string, string> = {
    "3m": t("period3m"),
    "12m": t("period12m"),
    all: t("periodAll"),
  };
  const categoryLabels: Record<string, string> = {
    contribution: t("catContribution"),
    disbursement: t("catDisbursement"),
    repayment: t("catRepayment"),
    distribution: t("catDistribution"),
    fine: t("catFine"),
  };

  const selectClass =
    "h-10 w-full rounded-full border border-border bg-background px-4 text-sm text-foreground transition-colors hover:bg-secondary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50 sm:w-auto";

  const statementHref = `/api/profile/statement?${params.toString()}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="activity-period"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          {t("filterPeriod")}
        </label>
        <select
          id="activity-period"
          value={period}
          disabled={isPending}
          onChange={(e) => setParam("period", e.target.value)}
          className={selectClass}
        >
          {LEDGER_PERIODS.map((p) => (
            <option key={p} value={p}>
              {periodLabels[p]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="activity-category"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          {t("filterCategory")}
        </label>
        <select
          id="activity-category"
          value={category}
          disabled={isPending}
          onChange={(e) => setParam("category", e.target.value)}
          className={selectClass}
        >
          <option value="all">{t("allCategories")}</option>
          {LEDGER_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      {groups.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="activity-group"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            {t("filterGroup")}
          </label>
          <select
            id="activity-group"
            value={groupId}
            disabled={isPending}
            onChange={(e) => setParam("group", e.target.value)}
            className={selectClass}
          >
            <option value="all">{t("allGroups")}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="sm:ms-auto">
        <Button
          asChild
          variant="outline"
          className={cn("h-10 w-full rounded-full px-4 sm:w-auto", isPending && "opacity-50")}
        >
          <a href={statementHref} download>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            {t("downloadStatement")}
          </a>
        </Button>
      </div>
    </div>
  );
}
