import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { calculateMemberBalance } from "@/lib/balances";
import { getGroupWithMembership } from "@/lib/groups";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { ClipboardList } from "lucide-react";
import { PendingLoanActions } from "./pending-loan-actions";
import { DisburseButton } from "./disburse-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans");
  return { title: `${t("pendingRequestsTitle")} — Digital Ibimina` };
}

function monthsAsMember(joinedAt: Date): number {
  const now = new Date();
  return Math.max(
    0,
    (now.getFullYear() - joinedAt.getFullYear()) * 12 + (now.getMonth() - joinedAt.getMonth()),
  );
}

export default async function PendingLoansPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  // Only the leader may see or act on requests here.
  if (membership.role !== "LEADER") {
    redirect(`/dashboard/groups/${groupId}/loans`);
  }

  const [locale, t, pendingLoans, approvedLoans] = await Promise.all([
    getLocale(),
    getTranslations("loans"),
    prisma.loan.findMany({
      where: { membership: { groupId }, status: "PENDING" },
      include: {
        membership: { include: { user: { select: { name: true } } } },
        guarantor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.loan.findMany({
      where: { membership: { groupId }, status: "APPROVED" },
      include: { membership: { include: { user: { select: { name: true } } } } },
      orderBy: { approvedAt: "asc" },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  const pendingWithBalance = await Promise.all(
    pendingLoans.map(async (loan) => ({
      loan,
      balance: await calculateMemberBalance(loan.membershipId),
      months: monthsAsMember(loan.membership.joinedAt),
    })),
  );

  return (
    <div className="mx-auto max-w-2xl">
      {/* The [id] layout already shows "Groups > {group name}" above this */}
      <Breadcrumbs
        items={[
          { label: t("title"), href: `/dashboard/groups/${groupId}/loans` },
          { label: t("pendingRequestsTitle") },
        ]}
      />
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {t("pendingRequestsTitle")}
      </h1>

      {pendingWithBalance.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={ClipboardList} title={t("noPendingLoans")} subtitle="" />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {pendingWithBalance.map(({ loan, balance, months }) => (
            <div
              key={loan.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-warm-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-foreground">
                    {loan.membership.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("contributionSummary", { amount: formatRWF(balance.totalContributed, locale) })}
                    {" · "}
                    {t("monthsAsMember", { count: months })}
                  </p>
                </div>
                <p className="shrink-0 font-display text-lg font-semibold text-primary">
                  {formatRWF(loan.amount, locale)}
                </p>
              </div>

              <p className="mt-2 text-sm text-foreground">{loan.purpose}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("requestedOn", { date: dateFormatter.format(loan.requestedAt) })} ·{" "}
                {t("dueDateLabel")}: {dateFormatter.format(loan.dueDate)}
              </p>
              {loan.guarantor && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("guarantorLabel")}: {loan.guarantor.user.name}
                </p>
              )}

              <div className="mt-4">
                <PendingLoanActions loanId={loan.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {approvedLoans.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("statusApproved")}
          </h2>
          <div className="mt-3 space-y-3">
            {approvedLoans.map((loan) => (
              <div
                key={loan.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-warm-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-semibold text-foreground">
                    {loan.membership.user.name}
                  </p>
                  <p className="font-display text-lg font-semibold text-primary">
                    {formatRWF(loan.amount, locale)}
                  </p>
                </div>
                <div className="mt-3">
                  <DisburseButton loanId={loan.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
