import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { meetingDayLabel, nextMeetingDate } from "@/lib/days";
import { calculateGroupSummary } from "@/lib/balances";
import { getGroupWithMembership } from "@/lib/groups";

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

  const [locale, t, summary, recentContributions] = await Promise.all([
    getLocale(),
    getTranslations("groups"),
    calculateGroupSummary(groupId),
    prisma.contribution.findMany({
      where: { membership: { groupId } },
      include: { membership: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  });
  const nextMeeting = dateFormatter.format(nextMeetingDate(group.meetingDay));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("totalPool")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
            {formatRWF(summary.totalPool, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-accent/10 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("activeLoans")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-accent-foreground">
            {formatRWF(summary.totalLoansOut, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {t("contributionsThisCycle")}
          </p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
            {formatRWF(summary.totalContributions, locale)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-warm-sm">
        <p className="text-xs font-medium text-muted-foreground">{t("nextMeeting")}</p>
        <p className="mt-1 font-display font-semibold capitalize text-foreground">
          {nextMeeting} · {meetingDayLabel(group.meetingDay, locale)}
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("recentActivity")}
        </h2>
        {recentContributions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("noActivityYet")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentContributions.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">
                  {c.membership.user.name}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {formatRWF(c.amount, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
