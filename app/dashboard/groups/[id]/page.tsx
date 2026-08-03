import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { HandCoins, PlayCircle, ScrollText } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { meetingDayLabel, nextMeetingDate } from "@/lib/days";
import { calculateGroupSummary } from "@/lib/balances";
import { getGroupWithMembership } from "@/lib/groups";
import { Badge } from "@/components/ui/badge";
import { ActivityFeed, type ActivityItem } from "@/components/groups/activity-feed";

const MS_PER_DAY = 86_400_000;

const ROLE_BADGE: Record<string, string> = {
  LEADER: "bg-primary/10 text-primary",
  SECRETARY: "bg-accent/20 text-accent-foreground",
  MEMBER: "bg-secondary text-muted-foreground",
};

export default async function GroupOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  const canManage = membership.role === "LEADER" || membership.role === "SECRETARY";

  const [
    locale,
    tGroups,
    tLoans,
    tConstitution,
    summary,
    memberCount,
    activeLoans,
    overdueLoanCount,
    constitution,
    myAgreement,
    unpaidFines,
    recentContributions,
    recentLoans,
    recentMeetings,
    recentDecisions,
    recentFines,
  ] = await Promise.all([
    getLocale(),
    getTranslations("groups"),
    getTranslations("loans"),
    getTranslations("constitution"),
    calculateGroupSummary(groupId),
    prisma.membership.count({ where: { groupId } }),
    prisma.loan.aggregate({
      where: { membership: { groupId }, status: "ACTIVE" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.loan.count({
      where: { membership: { groupId }, status: "ACTIVE", dueDate: { lt: new Date() } },
    }),
    prisma.groupConstitution.findUnique({ where: { groupId } }),
    prisma.constitutionAgreement.findFirst({
      where: { constitution: { groupId }, membershipId: membership.id },
      orderBy: { version: "desc" },
    }),
    prisma.meetingAttendance.aggregate({
      where: { meeting: { groupId }, finePaid: false, fineAmount: { gt: 0 } },
      _sum: { fineAmount: true },
    }),
    prisma.contribution.findMany({
      where: { membership: { groupId } },
      include: { membership: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.loan.findMany({
      where: { membership: { groupId } },
      include: { membership: { include: { user: { select: { name: true } } } } },
      orderBy: { requestedAt: "desc" },
      take: 8,
    }),
    prisma.meeting.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.meetingDecision.findMany({
      where: { meeting: { groupId } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.meetingAttendance.findMany({
      where: { meeting: { groupId }, fineAmount: { gt: 0 } },
      include: { membership: { include: { user: { select: { name: true } } } } },
      orderBy: { recordedAt: "desc" },
      take: 8,
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
  const now = new Date();
  const nextMeeting = dateFormatter.format(nextMeetingDate(group.meetingDay));
  const daysUntilMeeting = Math.ceil(
    (nextMeetingDate(group.meetingDay).getTime() - now.setHours(0, 0, 0, 0)) / MS_PER_DAY,
  );
  const meetingDue = daysUntilMeeting === 0;

  const totalCycleDays = Math.max(
    1,
    Math.round((group.cycleEnd.getTime() - group.cycleStart.getTime()) / MS_PER_DAY),
  );
  const dayOfCycle = Math.min(
    totalCycleDays,
    Math.max(1, Math.ceil((Date.now() - group.cycleStart.getTime()) / MS_PER_DAY)),
  );
  const cycleDateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  const needsToAgree = Boolean(
    constitution?.publishedAt && myAgreement?.version !== constitution.version,
  );

  const membersNotAgreedCount =
    canManage && constitution?.publishedAt
      ? await prisma.membership.count({
          where: {
            groupId,
            constitutionAgreements: {
              none: { constitutionId: constitution.id, version: constitution.version },
            },
          },
        })
      : 0;

  const activityItems: ActivityItem[] = [
    ...recentContributions.map((c) => ({
      kind: "contribution" as const,
      timestamp: c.createdAt,
      name: c.membership.user.name,
      amountCents: c.amount,
      href: `/dashboard/groups/${groupId}/members/${c.membershipId}`,
    })),
    ...recentLoans.map((loan) => {
      const timestamp = loan.approvedAt ?? loan.rejectedAt ?? loan.takenAt ?? loan.requestedAt;
      return {
        kind: "loan" as const,
        timestamp,
        name: loan.membership.user.name,
        amountCents: loan.amount,
        status: loan.status,
        href: `/dashboard/groups/${groupId}/loans/${loan.id}`,
      };
    }),
    ...recentMeetings.map((m) => ({
      kind: "meeting" as const,
      timestamp: m.createdAt,
      dateLabel: cycleDateFormatter.format(m.date),
      href: `/dashboard/groups/${groupId}/meetings/${m.id}`,
    })),
    ...recentDecisions.map((d) => ({
      kind: "decision" as const,
      timestamp: d.createdAt,
      text: d.text,
      href: `/dashboard/groups/${groupId}/meetings`,
    })),
    ...recentFines.map((f) => ({
      kind: "fine" as const,
      timestamp: f.recordedAt,
      name: f.membership.user.name,
      amountCents: f.fineAmount,
      href: `/dashboard/groups/${groupId}/members/${f.membershipId}`,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Header block */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {tGroups("cycleRange", {
              start: cycleDateFormatter.format(group.cycleStart),
              end: cycleDateFormatter.format(group.cycleEnd),
            })}
          </p>
          <Badge
            variant="outline"
            className={`rounded-full border-none font-semibold ${ROLE_BADGE[membership.role]}`}
          >
            {tGroups(`role${membership.role.charAt(0)}${membership.role.slice(1).toLowerCase()}` as "roleLeader")}
          </Badge>
        </div>
        <p className="text-sm font-medium text-foreground">
          {tGroups("cycleNumberLabel", { number: group.cycleNumber })} ·{" "}
          {tGroups("dayOfCycle", { day: dayOfCycle, total: totalCycleDays })}
        </p>
      </div>

      {/* Big stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">{tGroups("statPool")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
            {formatRWF(summary.totalPool, locale)}
          </p>
        </div>
        <Link
          href={`/dashboard/groups/${groupId}/members`}
          className="rounded-2xl border border-border bg-secondary p-4 transition-transform hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-muted-foreground">{tGroups("statMembers")}</p>
          <p className="mt-1 font-display text-lg font-semibold text-foreground">{memberCount}</p>
        </Link>
        <Link
          href={`/dashboard/groups/${groupId}/loans`}
          className="rounded-2xl border border-border bg-accent/10 p-4 transition-transform hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-muted-foreground">{tGroups("statActiveLoans")}</p>
          <p className="mt-1 font-display text-lg font-semibold text-accent-foreground">
            {activeLoans._count} · {formatRWF(activeLoans._sum.amount ?? 0, locale)}
          </p>
        </Link>
        <Link
          href={`/dashboard/groups/${groupId}/loans?filter=overdue`}
          className="rounded-2xl border border-border bg-card p-4 transition-transform hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-muted-foreground">{tGroups("statOverdue")}</p>
          <p
            className={`mt-1 font-display text-lg font-semibold ${overdueLoanCount > 0 ? "text-destructive" : "text-foreground"}`}
          >
            {overdueLoanCount}
          </p>
        </Link>
      </div>

      {/* Key info row */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-warm-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">{tLoans("interestRateLabel")}</p>
          <p className="text-sm font-semibold text-foreground">{(group.interestRate / 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{tGroups("meetingDayLabel")}</p>
          <p className="text-sm font-semibold text-foreground capitalize">
            {meetingDayLabel(group.meetingDay, locale)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{tGroups("nextMeeting")}</p>
          <p className="text-sm font-semibold text-foreground">{nextMeeting}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{tGroups("contributionLabel")}</p>
          <p className="text-sm font-semibold text-foreground">
            {group.minContributionAmount === group.maxContributionAmount
              ? formatRWF(group.minContributionAmount, locale)
              : tGroups("contributionRange", {
                  min: formatRWF(group.minContributionAmount, locale),
                  max: formatRWF(group.maxContributionAmount, locale),
                })}
          </p>
        </div>
      </div>

      {unpaidFines._sum.fineAmount ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">
            {tGroups("unpaidFinesTotal", { amount: formatRWF(unpaidFines._sum.fineAmount, locale) })}
          </p>
        </div>
      ) : null}

      {/* Action buttons */}
      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          href={`/dashboard/groups/${groupId}/loans/new`}
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-warm-sm hover:bg-primary/90"
        >
          <HandCoins className="size-5" aria-hidden="true" />
          {tLoans("requestLoan")}
        </Link>
        {canManage && (
          <Link
            href={`/dashboard/groups/${groupId}/meetings/new`}
            className={`flex h-14 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold shadow-warm-sm ${
              meetingDue
                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            <PlayCircle className="size-5" aria-hidden="true" />
            {tGroups("startMeetingAction")}
          </Link>
        )}
        <Link
          href={`/dashboard/groups/${groupId}/constitution`}
          className="relative flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-secondary sm:col-span-2"
        >
          <ScrollText className="size-4" aria-hidden="true" />
          {tConstitution("viewRules")}
          {needsToAgree && (
            <Badge className="ml-1 rounded-full bg-destructive text-destructive-foreground">
              {tConstitution("needsAgreementBadge")}
            </Badge>
          )}
        </Link>
      </div>

      {canManage && membersNotAgreedCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {tConstitution("membersNotAgreedCount", { count: membersNotAgreedCount })}
        </p>
      )}

      {/* Recent activity */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tGroups("recentActivity")}
        </h2>
        {activityItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{tGroups("noActivityYet")}</p>
        ) : (
          <div className="mt-3">
            <ActivityFeed items={activityItems} locale={locale} />
          </div>
        )}
      </div>
    </div>
  );
}
