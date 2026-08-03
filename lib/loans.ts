import type { LateFeeType } from "@prisma/client";
import type { GroupSummary } from "@/lib/balances";

const MS_PER_DAY = 86_400_000;
const BASIS_POINTS_DENOMINATOR = 10_000; // 500 basis points = 5%

/**
 * Simple interest: principal * annual rate * (days / 365).
 * `interestRateBasisPoints` uses the same convention as Group.interestRate
 * (500 = 5% per year). Rounds to the nearest cent.
 */
export function calculateInterest(
  principalCents: number,
  interestRateBasisPoints: number,
  days: number,
): number {
  if (principalCents <= 0 || interestRateBasisPoints <= 0 || days <= 0) return 0;

  const annualRate = interestRateBasisPoints / BASIS_POINTS_DENOMINATOR;
  return Math.round(principalCents * annualRate * (days / 365));
}

export type LoanForOwed = {
  amount: number; // principal, cents
  interestRate: number; // basis points
  takenAt: Date | null;
  /** Late fees accrued so far (Loan.lateFeesAccrued) — defaults to 0 for callers that don't track fees. */
  lateFeesAccrued?: number;
};

export type PaymentForOwed = {
  amount: number; // cents
};

export type AmountOwed = {
  /** Principal still unpaid, after payments are applied fees-first, then interest. */
  principalRemaining: number;
  /**
   * Gross interest that has accrued as of `asOfDate` — a fact about time
   * passing, NOT reduced by payments. (Distinct from the interest portion
   * still owed, which is folded into `totalOwed` below.)
   */
  interestAccrued: number;
  /** Late fees still unpaid. */
  feesRemaining: number;
  /** What the borrower actually still owes today: principalRemaining + unpaid interest + unpaid fees. */
  totalOwed: number;
  daysElapsed: number;
};

/**
 * Current amount owed on a loan as of a given date.
 * Interest only starts accruing once the loan is disbursed (`takenAt` set).
 * Payments are applied fees-first, then interest, then principal.
 */
export function calculateAmountOwed(
  loan: LoanForOwed,
  payments: PaymentForOwed[],
  asOfDate: Date,
): AmountOwed {
  const daysElapsed = loan.takenAt
    ? Math.max(0, Math.floor((asOfDate.getTime() - loan.takenAt.getTime()) / MS_PER_DAY))
    : 0;

  const interestAccrued = loan.takenAt
    ? calculateInterest(loan.amount, loan.interestRate, daysElapsed)
    : 0;
  const feesAccrued = loan.lateFeesAccrued ?? 0;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const feesPaid = Math.min(totalPaid, feesAccrued);
  const afterFees = totalPaid - feesPaid;
  const interestPaid = Math.min(afterFees, interestAccrued);
  const principalPaid = Math.max(0, afterFees - interestAccrued);
  const principalRemaining = Math.max(0, loan.amount - principalPaid);
  const interestRemaining = interestAccrued - interestPaid;
  const feesRemaining = feesAccrued - feesPaid;

  return {
    principalRemaining,
    interestAccrued,
    feesRemaining,
    totalOwed: principalRemaining + interestRemaining + feesRemaining,
    daysElapsed,
  };
}

/**
 * Member's max borrowing limit for a group:
 * (total contributed so far) * (group.maxLoanMultiplier / 100), minus
 * whatever principal they already have out on active loans.
 */
export function calculateBorrowingLimit(
  totalContributedCents: number,
  activeLoanPrincipalsCents: number,
  maxLoanMultiplier: number,
): number {
  const cap = Math.floor(totalContributedCents * (maxLoanMultiplier / 100));
  return Math.max(0, cap - activeLoanPrincipalsCents);
}

/**
 * Group's lending capacity right now.
 *
 * `GroupSummary.totalPool` (lib/balances.ts) is already defined as cash
 * currently on hand — contributions plus repayments received, MINUS
 * principal currently out on active loans. So it already IS the lending
 * capacity; there's nothing left to subtract. (A naive
 * "totalPool - totalLoansOut" here would double-count the loans already
 * netted out of totalPool.)
 */
export function calculateGroupLendingCapacity(groupSummary: Pick<GroupSummary, "totalPool">): number {
  return Math.max(0, groupSummary.totalPool);
}

export type LateFeeCalculation = {
  daysLate: number;
  daysCharged: number;
  feesAccrued: number;
};

/**
 * Late fees on an overdue loan, snapshot-configured at request time
 * (`Loan.latenessGraceDays`/`lateFeeType`/`lateFeeAmount`). Grace days are
 * forgiven entirely — fees only start accruing once `daysLate` exceeds them.
 */
export function calculateLateFees(
  dueDate: Date,
  latenessGraceDays: number,
  lateFeeType: LateFeeType,
  lateFeeAmount: number,
  outstandingPrincipal: number,
  asOfDate: Date,
): LateFeeCalculation {
  const daysLate = Math.max(0, Math.floor((asOfDate.getTime() - dueDate.getTime()) / MS_PER_DAY));
  const daysCharged = Math.max(0, daysLate - latenessGraceDays);

  if (lateFeeType === "NONE" || daysCharged === 0) {
    return { daysLate, daysCharged, feesAccrued: 0 };
  }

  const feesAccrued =
    lateFeeType === "FIXED"
      ? lateFeeAmount * daysCharged
      : Math.round(outstandingPrincipal * (lateFeeAmount / BASIS_POINTS_DENOMINATOR) * daysCharged);

  return { daysLate, daysCharged, feesAccrued };
}
