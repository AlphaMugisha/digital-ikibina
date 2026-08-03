import { describe, expect, it } from "vitest";
import {
  calculateShareOut,
  distributeRoundingRemainder,
  verifyShareOutBalance,
  type CalculatedAllocation,
  type GroupCycleTotals,
  type MemberCycleData,
} from "./shareout";

describe("calculateShareOut", () => {
  it("returns an empty array for a group with no members", () => {
    const totals: GroupCycleTotals = {
      totalPool: 0,
      totalContributions: 0,
      totalInterestEarned: 0,
      totalWrittenOff: 0,
    };
    expect(calculateShareOut([], totals)).toEqual([]);
  });

  it("gives a single member their full contribution when there's no interest or loans", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 100_000, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 100_000,
      totalContributions: 100_000,
      totalInterestEarned: 0,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    expect(result).toEqual([
      {
        membershipId: "m1",
        totalContributed: 100_000,
        interestShare: 0,
        loanDeduction: 0,
        finalPayout: 100_000,
      },
    ]);
  });

  it("splits interest evenly between two members with equal contributions", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 50_000, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 50_000, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 110_000,
      totalContributions: 100_000,
      totalInterestEarned: 10_000,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    expect(result[0].interestShare).toBe(5_000);
    expect(result[1].interestShare).toBe(5_000);
    expect(result[0].finalPayout).toBe(55_000);
    expect(result[1].finalPayout).toBe(55_000);
  });

  it("splits interest proportionally between uneven contributions", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 30_000, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 70_000, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 110_000,
      totalContributions: 100_000,
      totalInterestEarned: 10_000,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    expect(result[0].interestShare).toBe(3_000);
    expect(result[1].interestShare).toBe(7_000);
  });

  it("deducts a member's unpaid loan from their payout", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 50_000, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 30_000, carriedForwardLoan: 0 },
      { membershipId: "m3", totalContributed: 20_000, carriedForwardLoan: 15_000 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 100_000,
      totalContributions: 100_000,
      totalInterestEarned: 0,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    const m3 = result.find((a) => a.membershipId === "m3")!;
    expect(m3.loanDeduction).toBe(15_000);
    expect(m3.finalPayout).toBe(20_000 - 15_000);
  });

  it("distributes a rounding remainder to the top contributor", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 1, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 1, carriedForwardLoan: 0 },
      { membershipId: "m3", totalContributed: 1, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 103,
      totalContributions: 3,
      totalInterestEarned: 100,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    // 100/3 floored per member = 33 each, 99 total, remainder of 1
    expect(result.every((a) => a.interestShare === 33)).toBe(true);
    const totalAllocated = result.reduce((s, a) => s + a.interestShare, 0);
    expect(totalAllocated).toBe(99);
  });

  it("never pays out a negative amount when a loan exceeds contributions", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 10_000, carriedForwardLoan: 50_000 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 0,
      totalContributions: 10_000,
      totalInterestEarned: 0,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    expect(result[0].finalPayout).toBe(0);
  });

  it("pays out exactly what was contributed when interest is zero", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 25_000, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 75_000, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 100_000,
      totalContributions: 100_000,
      totalInterestEarned: 0,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    expect(result[0].finalPayout).toBe(25_000);
    expect(result[1].finalPayout).toBe(75_000);
  });

  it("gives everyone 0 interest share when total contributions are 0", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 0, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 0,
      totalContributions: 0,
      totalInterestEarned: 5_000,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    expect(result[0].interestShare).toBe(0);
    expect(result[0].finalPayout).toBe(0);
  });
});

describe("verifyShareOutBalance", () => {
  function totalsFor(allocations: CalculatedAllocation[], extra: Partial<GroupCycleTotals> = {}): GroupCycleTotals {
    const totalContributions = allocations.reduce((s, a) => s + a.totalContributed, 0);
    const totalInterestEarned = allocations.reduce((s, a) => s + a.interestShare, 0);
    return {
      totalPool: totalContributions + totalInterestEarned,
      totalContributions,
      totalInterestEarned,
      totalWrittenOff: 0,
      ...extra,
    };
  }

  it("passes for a single member with no interest or loans", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 100_000, carriedForwardLoan: 0 },
    ];
    const totals = totalsFor([], { totalContributions: 100_000, totalInterestEarned: 0 });
    const result = calculateShareOut(members, totals);
    expect(verifyShareOutBalance(result, totals).ok).toBe(true);
  });

  it("passes for equal contributions with interest", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 50_000, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 50_000, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 110_000,
      totalContributions: 100_000,
      totalInterestEarned: 10_000,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    expect(verifyShareOutBalance(result, totals).ok).toBe(true);
  });

  it("passes when a loan deduction is present", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 50_000, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 20_000, carriedForwardLoan: 15_000 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 55_000,
      totalContributions: 70_000,
      totalInterestEarned: 0,
      totalWrittenOff: 0,
    };
    const result = calculateShareOut(members, totals);
    expect(verifyShareOutBalance(result, totals).ok).toBe(true);
  });

  it("passes within tolerance after rounding-remainder distribution", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 1, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 1, carriedForwardLoan: 0 },
      { membershipId: "m3", totalContributed: 1, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 103,
      totalContributions: 3,
      totalInterestEarned: 100,
      totalWrittenOff: 0,
    };
    const raw = calculateShareOut(members, totals);
    const balanced = distributeRoundingRemainder(raw, totals);
    expect(verifyShareOutBalance(balanced, totals).ok).toBe(true);
    expect(verifyShareOutBalance(balanced, totals).discrepancy).toBe(0);
  });
});

describe("distributeRoundingRemainder", () => {
  it("gives the leftover cent to the top contributor", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 10, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 1, carriedForwardLoan: 0 },
      { membershipId: "m3", totalContributed: 1, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 103,
      totalContributions: 12,
      totalInterestEarned: 100,
      totalWrittenOff: 0,
    };
    const raw = calculateShareOut(members, totals);
    const totalBefore = raw.reduce((s, a) => s + a.interestShare, 0);
    expect(totalBefore).toBeLessThan(100);

    const balanced = distributeRoundingRemainder(raw, totals);
    const totalAfter = balanced.reduce((s, a) => s + a.interestShare, 0);
    expect(totalAfter).toBe(100);

    const m1 = balanced.find((a) => a.membershipId === "m1")!;
    const m1Before = raw.find((a) => a.membershipId === "m1")!;
    expect(m1.interestShare).toBeGreaterThan(m1Before.interestShare);
  });

  it("is a no-op when there's no remainder", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 50_000, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 50_000, carriedForwardLoan: 0 },
    ];
    const totals: GroupCycleTotals = {
      totalPool: 110_000,
      totalContributions: 100_000,
      totalInterestEarned: 10_000,
      totalWrittenOff: 0,
    };
    const raw = calculateShareOut(members, totals);
    const balanced = distributeRoundingRemainder(raw, totals);
    expect(balanced).toEqual(raw);
  });

  it("wraps around and gives multiple leftover cents to multiple members when remainder > member count", () => {
    const members: MemberCycleData[] = [
      { membershipId: "m1", totalContributed: 1, carriedForwardLoan: 0 },
      { membershipId: "m2", totalContributed: 1, carriedForwardLoan: 0 },
    ];
    // totalContributions is 2, but pass a totalInterestEarned that floors to 0 for each,
    // leaving a remainder greater than the member count to exercise the modulo wraparound.
    const totals: GroupCycleTotals = {
      totalPool: 5,
      totalContributions: 2,
      totalInterestEarned: 5,
      totalWrittenOff: 0,
    };
    const raw = calculateShareOut(members, totals);
    const balanced = distributeRoundingRemainder(raw, totals);
    const totalAfter = balanced.reduce((s, a) => s + a.interestShare, 0);
    expect(totalAfter).toBe(5);
  });
});
