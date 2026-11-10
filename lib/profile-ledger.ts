/**
 * Pure logic for the member's financial ledger.
 *
 * Deliberately free of Prisma and `server-only`: the queries live in
 * `lib/profile.ts`, which hands raw rows to these functions. That split keeps
 * the merge/filter/summarise rules unit-testable without a database.
 *
 * All money is integer cents, matching the rest of the app (see lib/money.ts).
 */

/** What kind of movement an entry represents. */
export const LEDGER_CATEGORIES = [
  "contribution",
  "disbursement",
  "repayment",
  "distribution",
  "fine",
] as const;

export type LedgerCategory = (typeof LEDGER_CATEGORIES)[number];

/** Direction from the member's own pocket, not the group's books. */
export type LedgerDirection = "in" | "out";

export type LedgerEntry = {
  /** Stable id, prefixed by source table so ids can't collide across sources. */
  id: string;
  date: Date;
  category: LedgerCategory;
  direction: LedgerDirection;
  /** Always positive; `direction` carries the sign. */
  amount: number;
  groupId: string;
  groupName: string;
  /** Source-specific state (loan status, allocation status, fine paid). */
  status: string | null;
  note: string | null;
};

/** Money leaving the member versus arriving, fixed per category. */
const DIRECTION: Record<LedgerCategory, LedgerDirection> = {
  contribution: "out",
  disbursement: "in",
  repayment: "out",
  distribution: "in",
  fine: "out",
};

export function directionFor(category: LedgerCategory): LedgerDirection {
  return DIRECTION[category];
}

export const LEDGER_PERIODS = ["3m", "12m", "all"] as const;
export type LedgerPeriod = (typeof LEDGER_PERIODS)[number];

export function isLedgerPeriod(value: string | undefined): value is LedgerPeriod {
  return !!value && (LEDGER_PERIODS as readonly string[]).includes(value);
}

export function isLedgerCategory(value: string | undefined): value is LedgerCategory {
  return !!value && (LEDGER_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Earliest date included by a period, or null for "all time".
 * Months are subtracted calendar-wise so "last 3 months" means what a person
 * means by it, rather than 90 fixed days.
 */
export function periodStart(period: LedgerPeriod, now: Date): Date | null {
  if (period === "all") return null;
  const months = period === "3m" ? 3 : 12;
  const start = new Date(now);
  start.setMonth(start.getMonth() - months);
  return start;
}

export type LedgerFilters = {
  period: LedgerPeriod;
  category: LedgerCategory | "all";
  groupId: string | "all";
};

/**
 * Newest first. Ties break on id so the order is stable across requests —
 * entries from different tables routinely share a timestamp (a contribution
 * and the fine recorded at the same meeting, for instance).
 */
export function sortLedger(entries: LedgerEntry[]): LedgerEntry[] {
  return [...entries].sort((a, b) => {
    const byDate = b.date.getTime() - a.date.getTime();
    return byDate !== 0 ? byDate : a.id.localeCompare(b.id);
  });
}

export function filterLedger(
  entries: LedgerEntry[],
  filters: LedgerFilters,
  now: Date,
): LedgerEntry[] {
  const start = periodStart(filters.period, now);

  return entries.filter((entry) => {
    if (start && entry.date < start) return false;
    if (filters.category !== "all" && entry.category !== filters.category) return false;
    if (filters.groupId !== "all" && entry.groupId !== filters.groupId) return false;
    return true;
  });
}

export type LedgerTotals = {
  /** Sum of entries arriving in the member's pocket, in cents. */
  totalIn: number;
  /** Sum of entries leaving it, in cents. */
  totalOut: number;
  count: number;
};

export function summariseLedger(entries: LedgerEntry[]): LedgerTotals {
  return entries.reduce<LedgerTotals>(
    (totals, entry) => ({
      totalIn: totals.totalIn + (entry.direction === "in" ? entry.amount : 0),
      totalOut: totals.totalOut + (entry.direction === "out" ? entry.amount : 0),
      count: totals.count + 1,
    }),
    { totalIn: 0, totalOut: 0, count: 0 },
  );
}

/**
 * Headline figures for the stat tiles.
 *
 * `null` means "could not be computed", which the UI must render differently
 * from a real zero — a member with no contributions genuinely has 0 RWF, and
 * that is not the same statement as "we don't know".
 */
export type FinancialSummary = {
  totalContributions: number;
  outstandingLoans: number;
  totalRepaid: number;
  distributionsReceived: number;
};
