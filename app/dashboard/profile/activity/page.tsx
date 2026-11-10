import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { formatRWF } from "@/lib/money";
import { getFinancialSummary, getLedger, getProfileMemberships } from "@/lib/profile";
import {
  filterLedger,
  isLedgerCategory,
  isLedgerPeriod,
  summariseLedger,
  type LedgerCategory,
  type LedgerEntry,
} from "@/lib/profile-ledger";
import { cn } from "@/lib/utils";
import { ActivityFilters } from "./activity-filters";

export default async function ProfileActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const one = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  const [locale, t, summary, ledger, memberships] = await Promise.all([
    getLocale(),
    getTranslations("profile"),
    getFinancialSummary(session.user.id),
    getLedger(session.user.id),
    getProfileMemberships(session.user.id),
  ]);

  const periodParam = one("period");
  const categoryParam = one("category");
  const groupParam = one("group");

  const filters = {
    period: isLedgerPeriod(periodParam) ? periodParam : ("12m" as const),
    category: isLedgerCategory(categoryParam) ? categoryParam : ("all" as const),
    groupId: groupParam && groupParam !== "all" ? groupParam : ("all" as const),
  };

  const visible = filterLedger(ledger, filters, new Date());
  const totals = summariseLedger(visible);

  const categoryLabel: Record<LedgerCategory, string> = {
    contribution: t("catContribution"),
    disbursement: t("catDisbursement"),
    repayment: t("catRepayment"),
    distribution: t("catDistribution"),
    fine: t("catFine"),
  };

  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const tiles = [
    { label: t("statContributions"), value: summary.totalContributions },
    { label: t("statOutstanding"), value: summary.outstandingLoans },
    { label: t("statRepaid"), value: summary.totalRepaid },
    { label: t("statDistributions"), value: summary.distributionsReceived },
  ];

  const groupOptions = memberships.map((m) => ({ id: m.groupId, name: m.groupName }));

  return (
    <div className="space-y-6">
      {/* Stat tiles. Every figure is a real aggregate; a member with no
          contributions sees 0 RWF because the query returned zero, which is a
          different statement from "unknown". */}
      <section
        aria-label={t("activityTitle")}
        className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-warm-sm lg:grid-cols-4"
      >
        {tiles.map((tile) => (
          <div key={tile.label} className="bg-card p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {tile.label}
            </p>
            <p className="font-display mt-2 text-lg font-medium tabular-nums tracking-tight text-foreground sm:text-xl">
              {formatRWF(tile.value, locale)}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-warm-sm">
        <div className="border-b border-border p-5 sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
            {t("historyTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("activitySubtitle")}</p>
          <div className="mt-5">
            <ActivityFilters groups={groupOptions} />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-display text-base font-medium text-foreground">
              {t("noTransactions")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("noTransactionsHint")}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: stacked rows. Desktop: a real table, which is what this
                data is and what screen readers navigate best. */}
            <ul className="divide-y divide-border sm:hidden">
              {visible.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {categoryLabel[entry.category]}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {entry.groupName} · {dateFmt.format(entry.date)}
                    </p>
                  </div>
                  <Amount entry={entry} locale={locale} t={t} />
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <caption className="sr-only">{t("historyTitle")}</caption>
                <thead>
                  <tr className="border-b border-border text-left">
                    <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("colDate")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("colDescription")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("colGroup")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("colAmount")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visible.map((entry) => (
                    <tr key={entry.id} className="transition-colors hover:bg-secondary/50">
                      <td className="whitespace-nowrap px-6 py-3.5 tabular-nums text-muted-foreground">
                        {dateFmt.format(entry.date)}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-foreground">
                        {categoryLabel[entry.category]}
                      </td>
                      <td className="max-w-[16rem] truncate px-6 py-3.5 text-muted-foreground">
                        {entry.groupName}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Amount entry={entry} locale={locale} t={t} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3.5 text-xs text-muted-foreground sm:px-6">
              <span>{t("showingCount", { count: totals.count })}</span>
              <span className="tabular-nums">
                <span className="text-success">+{formatRWF(totals.totalIn, locale)}</span>
                {" · "}
                <span>−{formatRWF(totals.totalOut, locale)}</span>
              </span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/** Signed amount; direction carries the sign, colour reinforces it. */
function Amount({
  entry,
  locale,
  t,
}: {
  entry: LedgerEntry;
  locale: string;
  t: (key: string) => string;
}) {
  const incoming = entry.direction === "in";
  return (
    <span
      className={cn(
        "whitespace-nowrap text-sm font-medium tabular-nums",
        incoming ? "text-success" : "text-foreground",
      )}
    >
      <span className="sr-only">{incoming ? t("moneyIn") : t("moneyOut")} </span>
      {incoming ? "+" : "−"}
      {formatRWF(entry.amount, locale)}
    </span>
  );
}
