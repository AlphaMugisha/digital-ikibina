import Link from "next/link";
import { Banknote, ClipboardList, HandCoins, ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { formatRWF } from "@/lib/money";
import type { LoanStatus } from "@prisma/client";

export type ActivityItem =
  | { kind: "contribution"; timestamp: Date; name: string; amountCents: number; href: string }
  | { kind: "loan"; timestamp: Date; name: string; amountCents: number; status: LoanStatus; href: string }
  | { kind: "meeting"; timestamp: Date; dateLabel: string; href: string }
  | { kind: "decision"; timestamp: Date; text: string; href: string }
  | { kind: "fine"; timestamp: Date; name: string; amountCents: number; href: string };

const ICONS = {
  contribution: Banknote,
  loan: HandCoins,
  meeting: ClipboardList,
  decision: ClipboardList,
  fine: ShieldAlert,
} as const;

const LOAN_STATUS_LABEL_KEY: Record<LoanStatus, string> = {
  PENDING: "activityLoanRequested",
  APPROVED: "activityLoanApproved",
  ACTIVE: "activityLoanDisbursed",
  PAID: "activityLoanPaid",
  REJECTED: "activityLoanRejected",
  DEFAULTED: "activityLoanDefaulted",
};

function timeAgo(date: Date, t: Awaited<ReturnType<typeof getTranslations<"groups">>>): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return t("timeAgoJustNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("timeAgoMinutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("timeAgoHours", { count: hours });
  const days = Math.floor(hours / 24);
  return t("timeAgoDays", { count: days });
}

export async function ActivityFeed({ items, locale }: { items: ActivityItem[]; locale: string }) {
  const t = await getTranslations("groups");

  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const Icon = ICONS[item.kind];
        let label: string;
        switch (item.kind) {
          case "contribution":
            label = t("activityContribution", { name: item.name, amount: formatRWF(item.amountCents, locale) });
            break;
          case "loan":
            label = t(LOAN_STATUS_LABEL_KEY[item.status] as "activityLoanRequested", {
              name: item.name,
              amount: formatRWF(item.amountCents, locale),
            });
            break;
          case "meeting":
            label = t("activityMeetingHeld", { date: item.dateLabel });
            break;
          case "decision":
            label = t("activityDecision", { text: item.text });
            break;
          case "fine":
            label = t("activityFine", { name: item.name, amount: formatRWF(item.amountCents, locale) });
            break;
        }

        return (
          <li key={i}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{label}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.timestamp, t)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
