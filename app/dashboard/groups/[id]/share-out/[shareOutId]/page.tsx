import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { verifyShareOutBalance } from "@/lib/shareout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ShareOutStatusBadge, AllocationStatusBadge } from "@/components/shareout/shareout-status-badge";
import { FinalizeCancelActions } from "./finalize-cancel-actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shareout");
  return { title: `${t("title")} — Digital Ibimina` };
}

export default async function ShareOutPreviewPage({
  params,
}: {
  params: Promise<{ id: string; shareOutId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId, shareOutId } = await params;

  const viewerMembership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });
  if (!viewerMembership) notFound();

  const shareOut = await prisma.shareOut.findUnique({
    where: { id: shareOutId },
    include: {
      allocations: {
        include: { membership: { include: { user: { select: { name: true } } } } },
        orderBy: { finalPayout: "desc" },
      },
      group: { select: { id: true, cycleNumber: true } },
    },
  });
  if (!shareOut || shareOut.groupId !== groupId) notFound();

  const [locale, t] = await Promise.all([getLocale(), getTranslations("shareout")]);
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  // Completed share-outs are historical; the live current cycle number only
  // applies to the still-open one (DRAFT/FINALIZED/CANCELLED).
  let cycleNumber = shareOut.group.cycleNumber;
  if (shareOut.status === "COMPLETED") {
    const completedBefore = await prisma.shareOut.count({
      where: { groupId, status: "COMPLETED", completedAt: { lt: shareOut.completedAt ?? new Date() } },
    });
    cycleNumber = completedBefore + 1;
  }

  const balance = verifyShareOutBalance(
    shareOut.allocations.map((a) => ({
      membershipId: a.membershipId,
      totalContributed: a.totalContributed,
      interestShare: a.interestShare,
      loanDeduction: a.loanDeduction,
      finalPayout: a.finalPayout,
    })),
    {
      totalPool: shareOut.totalPool,
      totalContributions: shareOut.totalContributions,
      totalInterestEarned: shareOut.totalInterestEarned,
      totalWrittenOff: shareOut.totalWrittenOff,
    },
  );

  const isLeader = viewerMembership.role === "LEADER";

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs
        items={[
          { label: t("title"), href: `/dashboard/groups/${groupId}/share-out` },
          { label: t("cycleNumber", { number: cycleNumber }) },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          {t("previewTitle", { number: cycleNumber })}
        </h1>
        <ShareOutStatusBadge status={shareOut.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("cycleDates", {
          start: dateFormatter.format(shareOut.cycleStart),
          end: dateFormatter.format(shareOut.cycleEnd),
        })}
      </p>

      <div className="mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("groupSummary")}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-primary/5 p-4">
            <p className="text-xs font-medium text-muted-foreground">{t("totalPool")}</p>
            <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
              {formatRWF(shareOut.totalPool, locale)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <p className="text-xs font-medium text-muted-foreground">{t("totalContributions")}</p>
            <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
              {formatRWF(shareOut.totalContributions, locale)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-accent/10 p-4">
            <p className="text-xs font-medium text-muted-foreground">{t("totalInterestEarned")}</p>
            <p className="mt-1 truncate font-display text-lg font-semibold text-accent-foreground">
              {formatRWF(shareOut.totalInterestEarned, locale)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">{t("totalWrittenOff")}</p>
            <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
              {formatRWF(shareOut.totalWrittenOff, locale)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
          <Badge status={balance.ok} />
          <span className="text-sm text-muted-foreground">
            {balance.ok ? t("balanceOk") : t("balanceDiscrepancy", { amount: formatRWF(balance.discrepancy, locale) })}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("memberTableName")}
        </h2>
        <div className="mt-3 space-y-2">
          {shareOut.allocations.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display font-semibold text-foreground">{a.membership.user.name}</p>
                <AllocationStatusBadge status={a.status} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">{t("totalContributed")}</span>
                <span className="text-right text-foreground">{formatRWF(a.totalContributed, locale)}</span>
                <span className="text-muted-foreground">{t("interestShare")}</span>
                <span className="text-right text-foreground">{formatRWF(a.interestShare, locale)}</span>
                <span className="text-muted-foreground">{t("loanDeduction")}</span>
                <span className="text-right text-foreground">-{formatRWF(a.loanDeduction, locale)}</span>
                <span className="font-medium text-foreground">{t("finalPayout")}</span>
                <span className="text-right font-semibold text-primary">{formatRWF(a.finalPayout, locale)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {shareOut.status === "DRAFT" && isLeader && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("leaderActions")}
          </h2>
          <div className="mt-3">
            <FinalizeCancelActions shareOutId={shareOut.id} groupId={groupId} />
          </div>
        </div>
      )}

      {shareOut.status === "DRAFT" && !isLeader && (
        <p className="mt-6 text-sm text-muted-foreground">{t("draftNoticeForMembers")}</p>
      )}

      {shareOut.status === "FINALIZED" && isLeader && (
        <div className="mt-6">
          <Link
            href={`/dashboard/groups/${groupId}/share-out/${shareOut.id}/payout`}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
          >
            {t("goToPayout")}
          </Link>
        </div>
      )}
    </div>
  );
}

function Badge({ status }: { status: boolean }) {
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        status ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
      }`}
      aria-hidden="true"
    >
      {status ? "✓" : "!"}
    </span>
  );
}
