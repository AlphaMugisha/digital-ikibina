import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { calculateAmountOwed } from "@/lib/loans";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";
import { LoanProgressBar } from "@/components/loans/loan-progress-bar";
import { RecordPaymentDialog } from "./record-payment-dialog";

const MS_PER_DAY = 86_400_000;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loanId: string }>;
}): Promise<Metadata> {
  const { loanId } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    select: { membership: { select: { user: { select: { name: true } } } } },
  });
  return { title: `${loan?.membership.user.name ?? "Loan"} — Digital Ibimina` };
}

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string; loanId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId, loanId } = await params;

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      membership: { include: { user: { select: { name: true } } } },
      guarantor: { include: { user: { select: { name: true } } } },
    },
  });
  if (!loan || loan.membership.groupId !== groupId) notFound();

  // Viewing is open to any member of the group (transparency for everyone,
  // same policy as meetings/contributions); only the leader/secretary can
  // act (record a payment) — enforced both in the UI below and server-side
  // in recordLoanPayment().
  const viewerMembership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });
  if (!viewerMembership) notFound();

  const [locale, t, payments] = await Promise.all([
    getLocale(),
    getTranslations("loans"),
    prisma.loanPayment.findMany({ where: { loanId }, orderBy: { paidAt: "asc" } }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  const now = new Date();
  const owed = calculateAmountOwed(loan, payments, now);
  const daysRemaining = Math.ceil((loan.dueDate.getTime() - now.getTime()) / MS_PER_DAY);
  const isOverdue = loan.status === "ACTIVE" && daysRemaining < 0;

  const originalTotal = loan.amount + owed.interestAccrued;
  const progressRatio = originalTotal > 0 ? 1 - owed.totalOwed / originalTotal : 0;

  // Running balance after each payment, in chronological order.
  const paymentRows = payments.map((payment, i) => {
    const runningOwed = calculateAmountOwed(
      loan,
      payments.slice(0, i + 1),
      payment.paidAt,
    ).totalOwed;
    return { payment, runningOwed };
  });

  const canManage = viewerMembership.role === "LEADER" || viewerMembership.role === "SECRETARY";

  return (
    <div className="mx-auto max-w-2xl">
      {/* The [id] layout already shows "Groups > {group name}" above this */}
      <Breadcrumbs
        items={[
          { label: t("title"), href: `/dashboard/groups/${groupId}/loans` },
          { label: loan.membership.user.name },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          {formatRWF(loan.amount, locale)}
        </h1>
        <LoanStatusBadge status={loan.status} />
        {isOverdue && (
          <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
            {t("overdue")}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{loan.purpose}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {loan.membership.user.name} · {t("dueDateLabel")}: {dateFormatter.format(loan.dueDate)}
      </p>
      {loan.guarantor && (
        <p className="mt-1 text-sm text-muted-foreground">
          {t("guarantorLabel")}: {loan.guarantor.user.name}
        </p>
      )}

      {(loan.status === "ACTIVE" || loan.status === "PAID") && (
        <div className="mt-6">
          <LoanProgressBar ratio={progressRatio} />
        </div>
      )}

      {loan.status === "ACTIVE" && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-primary/5 p-4">
            <p className="text-xs font-medium text-muted-foreground">{t("principalRemaining")}</p>
            <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
              {formatRWF(owed.principalRemaining, locale)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <p className="text-xs font-medium text-muted-foreground">{t("interestAccrued")}</p>
            <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
              {formatRWF(owed.interestAccrued, locale)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-accent/10 p-4">
            <p className="text-xs font-medium text-muted-foreground">{t("totalOwedToday")}</p>
            <p className="mt-1 truncate font-display text-lg font-semibold text-accent-foreground">
              {formatRWF(owed.totalOwed, locale)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">
              {daysRemaining >= 0 ? t("daysRemaining") : t("daysElapsed")}
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-foreground">
              {Math.abs(daysRemaining)}
            </p>
          </div>
        </div>
      )}

      {canManage && loan.status === "ACTIVE" && (
        <div className="mt-6">
          <RecordPaymentDialog loanId={loan.id} totalOwed={owed.totalOwed} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("paymentHistory")}
        </h2>
        {paymentRows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("noPaymentsYet")}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {paymentRows.map(({ payment, runningOwed }) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatRWF(payment.amount, locale)}
                  </p>
                  <p className="text-xs text-muted-foreground">{dateFormatter.format(payment.paidAt)}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("totalOwedToday")}: {formatRWF(runningOwed, locale)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
