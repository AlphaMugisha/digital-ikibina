import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { calculateGroupSummary } from "@/lib/balances";
import { calculateBorrowingLimit, calculateGroupLendingCapacity } from "@/lib/loans";
import { getGroupWithMembership } from "@/lib/groups";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LoanRequestForm } from "./loan-request-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans");
  return { title: `${t("requestTitle")} — Digital Ibimina` };
}

export default async function NewLoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  const [locale, tLoans, contributions, activeLoans, groupSummary, otherMembers] =
    await Promise.all([
      getLocale(),
      getTranslations("loans"),
      prisma.contribution.aggregate({
        where: { membershipId: membership.id },
        _sum: { amount: true },
      }),
      prisma.loan.aggregate({
        where: { membershipId: membership.id, status: "ACTIVE" },
        _sum: { amount: true },
      }),
      calculateGroupSummary(groupId),
      prisma.membership.findMany({
        where: { groupId, id: { not: membership.id } },
        include: { user: { select: { name: true } } },
        orderBy: { joinedAt: "asc" },
      }),
    ]);

  const borrowingLimit = calculateBorrowingLimit(
    contributions._sum.amount ?? 0,
    activeLoans._sum.amount ?? 0,
    group.maxLoanMultiplier,
  );
  const lendingCapacity = calculateGroupLendingCapacity(groupSummary);

  return (
    <div className="mx-auto max-w-md">
      {/* The [id] layout already shows "Groups > {group name}" above this */}
      <Breadcrumbs
        items={[
          { label: tLoans("title"), href: `/dashboard/groups/${groupId}/loans` },
          { label: tLoans("requestTitle") },
        ]}
      />
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {tLoans("requestTitle")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{tLoans("requestSubtitle")}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">{tLoans("borrowingLimit")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
            {formatRWF(borrowingLimit, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary p-4">
          <p className="text-xs font-medium text-muted-foreground">{tLoans("lendingCapacity")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
            {formatRWF(lendingCapacity, locale)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {tLoans("interestRateLabel")}: {(group.interestRate / 100).toFixed(2)}%
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-warm-sm">
        <LoanRequestForm
          groupId={groupId}
          interestRateBasisPoints={group.interestRate}
          maxLoanDurationDays={group.maxLoanDurationDays}
          requireGuarantor={group.requireGuarantor}
          otherMembers={otherMembers.map((m) => ({ id: m.id, name: m.user.name }))}
        />
      </div>
    </div>
  );
}
