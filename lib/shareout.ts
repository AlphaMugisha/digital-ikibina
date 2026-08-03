export interface MemberCycleData {
  membershipId: string;
  totalContributed: number;        // sum of contributions in this cycle
  carriedForwardLoan: number;      // active loan principal at cycle end (unpaid)
}

export interface GroupCycleTotals {
  totalPool: number;               // cash on hand
  totalContributions: number;      // sum of all member contributions
  totalInterestEarned: number;     // from PAID loans in this cycle
  totalWrittenOff: number;         // from DEFAULTED loans
}

export interface CalculatedAllocation {
  membershipId: string;
  totalContributed: number;
  interestShare: number;
  loanDeduction: number;
  finalPayout: number;
}

/**
 * The share-out formula.
 *
 * Each member's share of interest is proportional to how much they contributed.
 * Their final payout = contributions + their interest share − any unpaid loans.
 *
 * @param members - all members in the cycle with their contribution + loan data
 * @param totals - group-wide totals for the cycle
 * @returns per-member allocations. Sum of finalPayouts + writeoffs should equal totalPool.
 */
export function calculateShareOut(
  members: MemberCycleData[],
  totals: GroupCycleTotals,
): CalculatedAllocation[] {
  const totalContributions = members.reduce((s, m) => s + m.totalContributed, 0);

  return members.map((m) => {
    // Proportional share of interest based on contribution ratio
    // If they contributed 20% of the pool, they get 20% of the interest
    const interestShare = totalContributions === 0
      ? 0
      : Math.floor((m.totalContributed * totals.totalInterestEarned) / totalContributions);

    const loanDeduction = m.carriedForwardLoan;
    const finalPayout = Math.max(0, m.totalContributed + interestShare - loanDeduction);

    return {
      membershipId: m.membershipId,
      totalContributed: m.totalContributed,
      interestShare,
      loanDeduction,
      finalPayout,
    };
  });
}

/**
 * Verifies the share-out balances mathematically.
 * The sum of what's paid out + written off should equal what came in.
 */
export function verifyShareOutBalance(
  allocations: CalculatedAllocation[],
  totals: GroupCycleTotals,
): { ok: boolean; expected: number; actual: number; discrepancy: number } {
  const totalPayouts = allocations.reduce((s, a) => s + a.finalPayout, 0);
  const totalLoanDeductions = allocations.reduce((s, a) => s + a.loanDeduction, 0);
  // Expected: contributions + interest = payouts + carried loans + rounding tolerance
  const expected = totals.totalContributions + totals.totalInterestEarned;
  const actual = totalPayouts + totalLoanDeductions;
  const discrepancy = Math.abs(expected - actual);
  // Allow up to N cents of rounding (1 cent per member from floor operations)
  return {
    ok: discrepancy <= allocations.length,
    expected,
    actual,
    discrepancy,
  };
}

/**
 * Distributes rounding remainder to members with the largest contributions
 * (so no cent is lost to Math.floor across the group).
 */
export function distributeRoundingRemainder(
  allocations: CalculatedAllocation[],
  totals: GroupCycleTotals,
): CalculatedAllocation[] {
  const totalInterestAllocated = allocations.reduce((s, a) => s + a.interestShare, 0);
  const remainder = totals.totalInterestEarned - totalInterestAllocated;
  if (remainder === 0) return allocations;

  // Give the leftover cents to the top contributors
  const sorted = [...allocations].sort((a, b) => b.totalContributed - a.totalContributed);
  const updated = [...allocations];
  for (let i = 0; i < remainder; i++) {
    const target = sorted[i % sorted.length];
    const idx = updated.findIndex((a) => a.membershipId === target.membershipId);
    updated[idx] = {
      ...updated[idx],
      interestShare: updated[idx].interestShare + 1,
      finalPayout: updated[idx].finalPayout + 1,
    };
  }
  return updated;
}
