import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { calculateMemberBalance } from "@/lib/balances";
import { calculateAmountOwed } from "@/lib/loans";
import { getGroupWithMembership } from "@/lib/groups";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";
import { ShareOutStatusBadge } from "@/components/shareout/shareout-status-badge";
import { MemberDetailTabs } from "@/components/members/member-detail-tabs";
import { MarkFinePaidButton } from "./mark-fine-paid-button";

const ROLE_BADGE: Record<string, string> = {
  LEADER: "bg-primary/10 text-primary",
  SECRETARY: "bg-accent/20 text-accent-foreground",
  MEMBER: "bg-secondary text-muted-foreground",
};

const ATTENDANCE_BADGE: Record<string, string> = {
  PRESENT: "bg-primary/10 text-primary",
  LATE: "bg-accent/20 text-accent-foreground",
  EXCUSED: "bg-secondary text-muted-foreground",
  ABSENT: "bg-destructive/10 text-destructive",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ memberId: string }>;
}): Promise<Metadata> {
  const { memberId } = await params;
  const membership = await prisma.membership.findUnique({
    where: { id: memberId },
    select: { user: { select: { name: true } } },
  });
  return { title: `${membership?.user.name ?? ""} — Digital Ibimina` };
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string; memberId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId, memberId } = await params;

  const { group, membership: viewerMembership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !viewerMembership) notFound();

  const target = await prisma.membership.findFirst({
    where: { id: memberId, groupId },
    include: { user: { select: { name: true, phone: true } } },
  });
  if (!target) notFound();

  const canManage = viewerMembership.role === "LEADER" || viewerMembership.role === "SECRETARY";

  const [locale, t, tGroups, tShareOut, tAttendance, tFines, balance, contributions, loans, allocations, attendances, meetingCount] =
    await Promise.all([
      getLocale(),
      getTranslations("members"),
      getTranslations("groups"),
      getTranslations("shareout"),
      getTranslations("attendance"),
      getTranslations("fines"),
      calculateMemberBalance(memberId),
      prisma.contribution.findMany({
        where: { membershipId: memberId },
        include: { meeting: { select: { date: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.loan.findMany({
        where: { membershipId: memberId },
        include: { payments: true },
        orderBy: { requestedAt: "desc" },
      }),
      prisma.shareOutAllocation.findMany({
        where: { membershipId: memberId },
        include: { shareOut: { select: { status: true, cycleStart: true, cycleEnd: true } } },
        orderBy: { shareOut: { cycleStart: "desc" } },
      }),
      prisma.meetingAttendance.findMany({
        where: { membershipId: memberId },
        include: { meeting: { select: { date: true } } },
        orderBy: { meeting: { date: "desc" } },
      }),
      prisma.meeting.count({ where: { groupId, date: { gte: group.cycleStart, lte: group.cycleEnd } } }),
    ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  const now = new Date();
  const loanRows = loans.map((loan) => {
    const owed =
      loan.status === "ACTIVE" ? calculateAmountOwed(loan, loan.payments, now) : null;
    return { loan, owed };
  });

  const borrowedLifetime = loans
    .filter((loan) => loan.takenAt !== null)
    .reduce((sum, loan) => sum + loan.amount, 0);
  const repaidLifetime = loans.reduce(
    (sum, loan) => sum + loan.payments.reduce((s, p) => s + p.amount, 0),
    0,
  );
  const outstandingNow = loanRows.reduce(
    (sum, { owed }) => sum + (owed?.principalRemaining ?? 0),
    0,
  );

  const presentCount = attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const unpaidFines = attendances.filter((a) => a.fineAmount > 0 && !a.finePaid);
  const unpaidFinesTotal = unpaidFines.reduce((sum, a) => sum + a.fineAmount, 0);

  const overviewContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("totalContributed")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
            {formatRWF(balance.totalContributed, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("activeLoanAmount")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
            {formatRWF(balance.activeLoanAmount, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-accent/10 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("netBalance")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-accent-foreground">
            {formatRWF(balance.netBalance, locale)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("borrowedLifetime")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
            {formatRWF(borrowedLifetime, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("repaidLifetime")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
            {formatRWF(repaidLifetime, locale)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground">{t("attendanceRateLabel")}</p>
        <p className="mt-1 font-display text-lg font-semibold text-foreground">
          {t("attendanceRate", { present: presentCount, total: meetingCount })}
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tShareOut("memberHistoryTitle")}
        </h2>
        {allocations.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{tShareOut("noShareOutHistoryYet")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {allocations.map((a) => (
              <li key={a.id} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">
                    {tShareOut("cycleDates", {
                      start: dateFormatter.format(a.shareOut.cycleStart),
                      end: dateFormatter.format(a.shareOut.cycleEnd),
                    })}
                  </span>
                  <ShareOutStatusBadge status={a.shareOut.status} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">{tShareOut("totalContributed")}</span>
                  <span className="text-right text-foreground">{formatRWF(a.totalContributed, locale)}</span>
                  <span className="text-muted-foreground">{tShareOut("interestShare")}</span>
                  <span className="text-right text-foreground">{formatRWF(a.interestShare, locale)}</span>
                  <span className="text-muted-foreground">{tShareOut("loanDeduction")}</span>
                  <span className="text-right text-foreground">-{formatRWF(a.loanDeduction, locale)}</span>
                  <span className="font-medium text-foreground">{tShareOut("finalPayout")}</span>
                  <span className="text-right font-semibold text-primary">
                    {formatRWF(a.finalPayout, locale)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const contributionsContent =
    contributions.length === 0 ? (
      <p className="text-sm text-muted-foreground">{t("noContributionsYet")}</p>
    ) : (
      <ul className="space-y-2">
        {contributions.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="text-sm text-muted-foreground">
              {dateFormatter.format(c.meeting.date)}
            </span>
            <span className="text-sm font-semibold text-primary">
              {formatRWF(c.amount, locale)}
            </span>
          </li>
        ))}
      </ul>
    );

  const loansContent =
    loanRows.length === 0 ? (
      <p className="text-sm text-muted-foreground">{t("noLoansYet")}</p>
    ) : (
      <>
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-2xl border border-border bg-accent/10 p-4">
            <p className="text-xs font-medium text-muted-foreground">{t("outstandingNow")}</p>
            <p className="mt-1 truncate font-display text-lg font-semibold text-accent-foreground">
              {formatRWF(outstandingNow, locale)}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {loanRows.map(({ loan, owed }) => (
            <Link
              key={loan.id}
              href={`/dashboard/groups/${groupId}/loans/${loan.id}`}
              className="block rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatRWF(loan.amount, locale)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {loan.purpose} · {dateFormatter.format(loan.requestedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <LoanStatusBadge status={loan.status} />
                  {owed && (
                    <span className="text-xs font-semibold text-accent-foreground">
                      {formatRWF(owed.totalOwed, locale)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </>
    );

  const attendanceContent =
    attendances.length === 0 ? (
      <p className="text-sm text-muted-foreground">{tAttendance("noRecordsYet")}</p>
    ) : (
      <ul className="space-y-2">
        {attendances.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="text-sm text-muted-foreground">{dateFormatter.format(a.meeting.date)}</span>
            <Badge variant="outline" className={`rounded-full border-none font-semibold ${ATTENDANCE_BADGE[a.status]}`}>
              {tAttendance(a.status.toLowerCase() as "present")}
            </Badge>
          </li>
        ))}
      </ul>
    );

  const finesContent =
    attendances.filter((a) => a.fineAmount > 0).length === 0 ? (
      <p className="text-sm text-muted-foreground">{tFines("noFinesYet")}</p>
    ) : (
      <>
        {unpaidFinesTotal > 0 && (
          <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <p className="text-sm font-semibold text-destructive">
              {tFines("unpaidTotal", { amount: formatRWF(unpaidFinesTotal, locale) })}
            </p>
          </div>
        )}
        <ul className="space-y-2">
          {attendances
            .filter((a) => a.fineAmount > 0)
            .map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm text-foreground">{dateFormatter.format(a.meeting.date)}</p>
                  <p className="text-sm font-semibold text-destructive">{formatRWF(a.fineAmount, locale)}</p>
                </div>
                {a.finePaid ? (
                  <Badge variant="outline" className="rounded-full border-none bg-primary/10 font-semibold text-primary">
                    {tFines("paid")}
                  </Badge>
                ) : canManage ? (
                  <MarkFinePaidButton attendanceId={a.id} />
                ) : (
                  <Badge variant="outline" className="rounded-full border-none bg-destructive/10 font-semibold text-destructive">
                    {tFines("unpaid")}
                  </Badge>
                )}
              </li>
            ))}
        </ul>
      </>
    );

  return (
    <div>
      {/* The [id] layout already shows "Groups > {group name}" above this */}
      <Breadcrumbs
        items={[
          { label: tGroups("tabMembers"), href: `/dashboard/groups/${groupId}/members` },
          { label: target.user.name },
        ]}
      />

      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
            {target.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-foreground">
              {target.user.name}
            </h1>
            <Badge
              variant="outline"
              className={`rounded-full border-none font-semibold ${ROLE_BADGE[target.role]}`}
            >
              {tGroups(
                `role${target.role.charAt(0)}${target.role.slice(1).toLowerCase()}` as "roleLeader",
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("phoneEndingIn", { digits: target.user.phone.slice(-4) })} · {t("joinedOn", { date: dateFormatter.format(target.joinedAt) })}
          </p>
        </div>
      </div>

      <MemberDetailTabs
        overview={overviewContent}
        contributions={contributionsContent}
        loans={loansContent}
        attendance={attendanceContent}
        fines={finesContent}
      />
    </div>
  );
}
