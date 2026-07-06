import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { calculateMemberBalance } from "@/lib/balances";
import { calculateAmountOwed } from "@/lib/loans";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";

const ROLE_BADGE: Record<string, string> = {
  LEADER: "bg-primary/10 text-primary",
  SECRETARY: "bg-accent/20 text-accent-foreground",
  MEMBER: "bg-secondary text-muted-foreground",
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

  // Viewer must themselves be a member of this group.
  const viewerMembership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });
  if (!viewerMembership) notFound();

  const target = await prisma.membership.findFirst({
    where: { id: memberId, groupId },
    include: { user: { select: { name: true, phone: true } } },
  });
  if (!target) notFound();

  const [locale, t, tGroups, balance, contributions, loans] = await Promise.all([
    getLocale(),
    getTranslations("members"),
    getTranslations("groups"),
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
          <p className="text-sm text-muted-foreground">{target.user.phone}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
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

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("contributionHistory")}
        </h2>
        {contributions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("noContributionsYet")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
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
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("loanHistory")}
        </h2>

        {loanRows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("noLoansYet")}</p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-3 gap-3">
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
        )}
      </div>
    </div>
  );
}
