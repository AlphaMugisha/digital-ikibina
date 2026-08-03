import { describe, expect, it } from "vitest";
import {
  calculateAmountOwed,
  calculateBorrowingLimit,
  calculateGroupLendingCapacity,
  calculateInterest,
  calculateLateFees,
} from "./loans";

describe("calculateInterest", () => {
  it("computes simple interest for a full year (known manual-math scenario)", () => {
    // 100,000 cents principal, 5% annual (500 bps), 365 days
    // = 100,000 * 0.05 * (365/365) = 5,000 cents exactly
    expect(calculateInterest(100_000, 500, 365)).toBe(5_000);
  });

  it("computes simple interest for a partial period with rounding", () => {
    // 1,000,000 cents principal, 10% annual (1000 bps), 90 days
    // = 1,000,000 * 0.10 * (90/365) = 24657.534... -> rounds to 24658
    expect(calculateInterest(1_000_000, 1_000, 90)).toBe(24_658);
  });

  it("returns 0 for 0% interest rate", () => {
    expect(calculateInterest(500_000, 0, 30)).toBe(0);
  });

  it("returns 0 for 0 principal", () => {
    expect(calculateInterest(0, 500, 90)).toBe(0);
  });

  it("returns 0 for 0 days", () => {
    expect(calculateInterest(100_000, 500, 0)).toBe(0);
  });

  it("returns 0 for negative days (should never happen, but must not go negative)", () => {
    expect(calculateInterest(100_000, 500, -10)).toBe(0);
  });
});

describe("calculateAmountOwed", () => {
  const jan1 = new Date("2026-01-01T00:00:00.000Z");
  const apr1 = new Date("2026-04-01T00:00:00.000Z"); // 90 days after jan1

  it("owes exactly principal + 0 interest when not yet disbursed", () => {
    const result = calculateAmountOwed(
      { amount: 200_000, interestRate: 500, takenAt: null },
      [],
      apr1,
    );
    expect(result).toEqual({
      principalRemaining: 200_000,
      interestAccrued: 0,
      feesRemaining: 0,
      totalOwed: 200_000,
      daysElapsed: 0,
    });
  });

  it("accrues interest once disbursed, with no payments", () => {
    // 1,000,000 cents @ 10% (1000 bps) for 90 days -> interest = 24,658 (see above)
    const result = calculateAmountOwed(
      { amount: 1_000_000, interestRate: 1_000, takenAt: jan1 },
      [],
      apr1,
    );
    expect(result.daysElapsed).toBe(90);
    expect(result.interestAccrued).toBe(24_658);
    expect(result.principalRemaining).toBe(1_000_000);
    expect(result.totalOwed).toBe(1_000_000 + 24_658);
  });

  it("applies a partial payment to interest first, then principal", () => {
    // Same loan as above: principal 1,000,000, interest accrued 24,658.
    // A payment of 10,000 only covers part of the interest.
    const result = calculateAmountOwed(
      { amount: 1_000_000, interestRate: 1_000, takenAt: jan1 },
      [{ amount: 10_000 }],
      apr1,
    );
    expect(result.principalRemaining).toBe(1_000_000); // untouched, interest not fully paid yet
    expect(result.interestAccrued).toBe(24_658); // gross fact, unaffected by payments
    expect(result.totalOwed).toBe(1_000_000 + (24_658 - 10_000));
  });

  it("applies a payment larger than accrued interest to principal too", () => {
    // Payment of 50,000 covers all 24,658 of interest, remaining 25,342 reduces principal.
    const result = calculateAmountOwed(
      { amount: 1_000_000, interestRate: 1_000, takenAt: jan1 },
      [{ amount: 50_000 }],
      apr1,
    );
    const expectedPrincipalPaid = 50_000 - 24_658;
    expect(result.principalRemaining).toBe(1_000_000 - expectedPrincipalPaid);
    expect(result.totalOwed).toBe(result.principalRemaining);
  });

  it("sums multiple payments correctly", () => {
    const result = calculateAmountOwed(
      { amount: 1_000_000, interestRate: 1_000, takenAt: jan1 },
      [{ amount: 10_000 }, { amount: 14_658 }],
      apr1,
    );
    // 10,000 + 14,658 = 24,658 exactly covers interest
    expect(result.principalRemaining).toBe(1_000_000);
    expect(result.totalOwed).toBe(1_000_000);
  });

  it("reaches exactly 0 owed on an exact full repayment", () => {
    const result = calculateAmountOwed(
      { amount: 1_000_000, interestRate: 1_000, takenAt: jan1 },
      [{ amount: 1_000_000 + 24_658 }],
      apr1,
    );
    expect(result.totalOwed).toBe(0);
    expect(result.principalRemaining).toBe(0);
  });

  it("never goes negative on overpayment", () => {
    const result = calculateAmountOwed(
      { amount: 1_000_000, interestRate: 1_000, takenAt: jan1 },
      [{ amount: 5_000_000 }], // way more than owed
      apr1,
    );
    expect(result.totalOwed).toBe(0);
    expect(result.principalRemaining).toBe(0);
  });

  it("handles 0% interest loans — payments go straight to principal", () => {
    const result = calculateAmountOwed(
      { amount: 300_000, interestRate: 0, takenAt: jan1 },
      [{ amount: 100_000 }],
      apr1,
    );
    expect(result.interestAccrued).toBe(0);
    expect(result.principalRemaining).toBe(200_000);
    expect(result.totalOwed).toBe(200_000);
  });

  it("handles a zero-amount loan gracefully", () => {
    const result = calculateAmountOwed(
      { amount: 0, interestRate: 500, takenAt: jan1 },
      [],
      apr1,
    );
    expect(result.totalOwed).toBe(0);
    expect(result.principalRemaining).toBe(0);
  });
});

describe("calculateBorrowingLimit", () => {
  it("computes multiplier of contributions with no active loans", () => {
    // 100,000 contributed, 300% multiplier -> limit 300,000
    expect(calculateBorrowingLimit(100_000, 0, 300)).toBe(300_000);
  });

  it("subtracts existing active loan principal from the limit", () => {
    expect(calculateBorrowingLimit(100_000, 200_000, 300)).toBe(100_000);
  });

  it("floors at 0 when active loans exceed the raw limit", () => {
    expect(calculateBorrowingLimit(100_000, 500_000, 300)).toBe(0);
  });

  it("returns 0 when the member has contributed nothing", () => {
    expect(calculateBorrowingLimit(0, 0, 300)).toBe(0);
  });

  it("handles a 100% (1x) multiplier", () => {
    expect(calculateBorrowingLimit(50_000, 0, 100)).toBe(50_000);
  });
});

describe("calculateLateFees", () => {
  const dueDate = new Date("2026-01-01T00:00:00.000Z");

  it("charges nothing before the due date", () => {
    const before = new Date("2025-12-20T00:00:00.000Z");
    const result = calculateLateFees(dueDate, 0, "FIXED", 500, 100_000, before);
    expect(result).toEqual({ daysLate: 0, daysCharged: 0, feesAccrued: 0 });
  });

  it("charges nothing while still within the grace period", () => {
    const asOf = new Date("2026-01-04T00:00:00.000Z"); // 3 days late
    const result = calculateLateFees(dueDate, 5, "FIXED", 500, 100_000, asOf);
    expect(result.daysLate).toBe(3);
    expect(result.daysCharged).toBe(0);
    expect(result.feesAccrued).toBe(0);
  });

  it("charges a FIXED fee per day once past the grace period", () => {
    // 10 days late, 2 grace days -> 8 days charged at 500 cents/day = 4000
    const asOf = new Date("2026-01-11T00:00:00.000Z");
    const result = calculateLateFees(dueDate, 2, "FIXED", 500, 100_000, asOf);
    expect(result.daysLate).toBe(10);
    expect(result.daysCharged).toBe(8);
    expect(result.feesAccrued).toBe(4_000);
  });

  it("charges a PERCENT fee of outstanding principal per day once past the grace period", () => {
    // 10 days late, 2 grace days -> 8 days charged at 1% (100 bps) of 100,000 = 1,000/day -> 8,000
    const asOf = new Date("2026-01-11T00:00:00.000Z");
    const result = calculateLateFees(dueDate, 2, "PERCENT", 100, 100_000, asOf);
    expect(result.daysLate).toBe(10);
    expect(result.daysCharged).toBe(8);
    expect(result.feesAccrued).toBe(8_000);
  });

  it("returns 0 fees when lateFeeType is NONE regardless of days late", () => {
    const asOf = new Date("2026-02-01T00:00:00.000Z");
    const result = calculateLateFees(dueDate, 0, "NONE", 999, 100_000, asOf);
    expect(result.feesAccrued).toBe(0);
  });

  it("scales correctly over a very long overdue period without overflow", () => {
    // 3 years (~1095 days) late, FIXED 100 cents/day
    const asOf = new Date("2029-01-01T00:00:00.000Z");
    const result = calculateLateFees(dueDate, 0, "FIXED", 100, 100_000, asOf);
    expect(result.daysLate).toBeGreaterThan(1000);
    expect(result.feesAccrued).toBe(result.daysCharged * 100);
    expect(Number.isFinite(result.feesAccrued)).toBe(true);
  });
});

describe("calculateGroupLendingCapacity", () => {
  it("returns the pool as-is when positive", () => {
    expect(calculateGroupLendingCapacity({ totalPool: 500_000 })).toBe(500_000);
  });

  it("floors at 0 when the pool is negative", () => {
    // Can happen transiently if loans-out exceed contributions+repayments
    expect(calculateGroupLendingCapacity({ totalPool: -50_000 })).toBe(0);
  });

  it("returns 0 for an empty pool", () => {
    expect(calculateGroupLendingCapacity({ totalPool: 0 })).toBe(0);
  });
});
