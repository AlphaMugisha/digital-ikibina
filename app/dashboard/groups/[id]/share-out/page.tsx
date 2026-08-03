import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { getGroupWithMembership } from "@/lib/groups";
import { gatherCycleData } from "@/lib/shareout-data";
import { LoanProgressBar } from "@/components/loans/loan-progress-bar";
import { StartShareOutButton } from "./start-share-out-button";

const MS_PER_DAY = 86_400_000;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shareout");
  return { title: `${t("title")} — Digital Ibimina` };
}

export default async function ShareOutTabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  const [locale, t, activeShareOut, activeLoanCount, pendingLoanCount, history] = await Promise.all([
    getLocale(),
    getTranslations("shareout"),
    prisma.shareOut.findFirst({
      where: { groupId, status: { in: ["DRAFT", "FINALIZED"] } },
      include: { _count: { select: { allocations: true } } },
    }),
    prisma.loan.count({ where: { membership: { groupId }, status: "ACTIVE" } }),
    prisma.loan.count({ where: { membership: { groupId }, status: { in: ["PENDING", "APPROVED"] } } }),
    prisma.shareOut.findMany({
      where: { groupId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      include: { _count: { select: { allocations: true } } },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const isLeader = membership.role === "LEADER";

  if (activeShareOut) {
    const paidCount = await prisma.shareOutAllocation.count({
      where: { shareOutId: activeShareOut.id, status: { in: ["PAID", "WAIVED"] } },
    });

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-primary/5 p-4 shadow-warm-sm">
          <h2 className="font-display font-semibold text-foreground">
            {activeShareOut.status === "DRAFT" ? t("draftReady") : t("finalizedReady")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeShareOut.status === "DRAFT"
              ? t("draftReadySubtitle")
              : t("membersPaidProgress", { paid: paidCount, total: activeShareOut._count.allocations })}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">{t("totalPool")}</p>
              <p className="mt-1 font-display font-semibold text-primary">
                {formatRWF(activeShareOut.totalPool, locale)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">{t("totalInterestEarned")}</p>
              <p className="mt-1 font-display font-semibold text-foreground">
                {formatRWF(activeShareOut.totalInterestEarned, locale)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            {activeShareOut.status === "DRAFT" ? (
              <Link
                href={`/dashboard/groups/${groupId}/share-out/${activeShareOut.id}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
              >
                {t("viewPreview")}
              </Link>
            ) : (
              isLeader && (
                <Link
                  href={`/dashboard/groups/${groupId}/share-out/${activeShareOut.id}/payout`}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
                >
                  {t("goToPayout")}
                </Link>
              )
            )}
          </div>
        </div>

        <ShareOutHistory
          history={history}
          groupId={groupId}
          locale={locale}
          dateFormatter={dateFormatter}
          t={t}
        />
      </div>
    );
  }

  const { totals } = await gatherCycleData(groupId);
  const now = Date.now();
  const totalDays = Math.max(1, (group.cycleEnd.getTime() - group.cycleStart.getTime()) / MS_PER_DAY);
  const elapsedDays = Math.min(totalDays, Math.max(0, (now - group.cycleStart.getTime()) / MS_PER_DAY));
  const daysRemaining = Math.max(0, Math.ceil((group.cycleEnd.getTime() - now) / MS_PER_DAY));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-warm-sm">
        <h2 className="font-display font-semibold text-foreground">
          {t("noActiveShareOutTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("currentCycle", { number: group.cycleNumber })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("daysRemainingUntil", { days: daysRemaining, date: dateFormatter.format(group.cycleEnd) })}
        </p>
        <div className="mt-3">
          <LoanProgressBar ratio={elapsedDays / totalDays} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-secondary p-3">
            <p className="text-xs font-medium text-muted-foreground">{t("totalContributions")}</p>
            <p className="mt-1 font-display font-semibold text-foreground">
              {formatRWF(totals.totalContributions, locale)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-accent/10 p-3">
            <p className="text-xs font-medium text-muted-foreground">{t("totalInterestEarned")}</p>
            <p className="mt-1 font-display font-semibold text-accent-foreground">
              {formatRWF(totals.totalInterestEarned, locale)}
            </p>
          </div>
        </div>

        {isLeader && (
          <div className="mt-4">
            {pendingLoanCount > 0 && (
              <p className="mb-2 text-xs text-destructive">
                {t("startShareOutWarningPendingLoans")}
              </p>
            )}
            {pendingLoanCount === 0 && activeLoanCount > 0 && (
              <p className="mb-2 text-xs text-muted-foreground">
                {t("startShareOutWarningActiveLoans")}
              </p>
            )}
            <StartShareOutButton groupId={groupId} disabled={pendingLoanCount > 0} />
          </div>
        )}
      </div>

      <ShareOutHistory
        history={history}
        groupId={groupId}
        locale={locale}
        dateFormatter={dateFormatter}
        t={t}
      />
    </div>
  );
}

function ShareOutHistory({
  history,
  groupId,
  locale,
  dateFormatter,
  t,
}: {
  history: { id: string; cycleStart: Date; cycleEnd: Date; totalPool: number; memberCount: number; _count: { allocations: number } }[];
  groupId: string;
  locale: string;
  dateFormatter: Intl.DateTimeFormat;
  t: Awaited<ReturnType<typeof getTranslations<"shareout">>>;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("historyTitle")}
      </h2>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("noHistoryYet")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {history.map((shareOut, i) => (
            <li key={shareOut.id}>
              <Link
                href={`/dashboard/groups/${groupId}/share-out/${shareOut.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("cycleNumber", { number: history.length - i })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("cycleDates", {
                      start: dateFormatter.format(shareOut.cycleStart),
                      end: dateFormatter.format(shareOut.cycleEnd),
                    })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatRWF(shareOut.totalPool, locale)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
