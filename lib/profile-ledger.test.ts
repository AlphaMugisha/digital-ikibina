import { describe, expect, it } from "vitest";
import {
  directionFor,
  filterLedger,
  isLedgerCategory,
  isLedgerPeriod,
  periodStart,
  sortLedger,
  summariseLedger,
  type LedgerEntry,
} from "./profile-ledger";

const NOW = new Date("2026-11-10T12:00:00.000Z");

function entry(over: Partial<LedgerEntry> & { id: string; date: Date }): LedgerEntry {
  const category = over.category ?? "contribution";
  return {
    category,
    direction: directionFor(category),
    amount: 100_000,
    groupId: "g1",
    groupName: "Abishyizehamwe",
    status: null,
    note: null,
    ...over,
  };
}

describe("directionFor", () => {
  it("treats money the member hands over as outgoing", () => {
    expect(directionFor("contribution")).toBe("out");
    expect(directionFor("repayment")).toBe("out");
    expect(directionFor("fine")).toBe("out");
  });

  it("treats money the member receives as incoming", () => {
    expect(directionFor("disbursement")).toBe("in");
    expect(directionFor("distribution")).toBe("in");
  });
});

describe("sortLedger", () => {
  it("puts the newest entry first", () => {
    const sorted = sortLedger([
      entry({ id: "a", date: new Date("2026-01-01") }),
      entry({ id: "b", date: new Date("2026-06-01") }),
      entry({ id: "c", date: new Date("2026-03-01") }),
    ]);
    expect(sorted.map((e) => e.id)).toEqual(["b", "c", "a"]);
  });

  it("breaks ties on id so the order is stable", () => {
    // A contribution and the fine from the same meeting share a timestamp.
    const same = new Date("2026-05-05T10:00:00.000Z");
    const first = sortLedger([
      entry({ id: "fine:2", date: same, category: "fine" }),
      entry({ id: "contribution:1", date: same }),
    ]);
    const second = sortLedger([
      entry({ id: "contribution:1", date: same }),
      entry({ id: "fine:2", date: same, category: "fine" }),
    ]);
    expect(first.map((e) => e.id)).toEqual(second.map((e) => e.id));
  });

  it("does not mutate its input", () => {
    const input = [
      entry({ id: "a", date: new Date("2026-01-01") }),
      entry({ id: "b", date: new Date("2026-06-01") }),
    ];
    sortLedger(input);
    expect(input.map((e) => e.id)).toEqual(["a", "b"]);
  });
});

describe("periodStart", () => {
  it("returns null for all time, so nothing is excluded", () => {
    expect(periodStart("all", NOW)).toBeNull();
  });

  it("subtracts calendar months rather than fixed days", () => {
    expect(periodStart("3m", NOW)?.toISOString().slice(0, 10)).toBe("2026-08-10");
    expect(periodStart("12m", NOW)?.toISOString().slice(0, 10)).toBe("2025-11-10");
  });
});

describe("filterLedger", () => {
  const entries = [
    entry({ id: "recent", date: new Date("2026-11-01") }),
    entry({ id: "fiveMonths", date: new Date("2026-06-01") }),
    entry({ id: "twoYears", date: new Date("2024-11-01") }),
    entry({ id: "otherGroup", date: new Date("2026-11-02"), groupId: "g2" }),
    entry({ id: "aFine", date: new Date("2026-11-03"), category: "fine" }),
  ];

  it("keeps only entries inside the period", () => {
    const got = filterLedger(entries, { period: "3m", category: "all", groupId: "all" }, NOW);
    expect(got.map((e) => e.id).sort()).toEqual(["aFine", "otherGroup", "recent"]);
  });

  it("keeps everything for all time", () => {
    const got = filterLedger(entries, { period: "all", category: "all", groupId: "all" }, NOW);
    expect(got).toHaveLength(entries.length);
  });

  it("filters by category", () => {
    const got = filterLedger(entries, { period: "all", category: "fine", groupId: "all" }, NOW);
    expect(got.map((e) => e.id)).toEqual(["aFine"]);
  });

  it("filters by ikimina", () => {
    const got = filterLedger(entries, { period: "all", category: "all", groupId: "g2" }, NOW);
    expect(got.map((e) => e.id)).toEqual(["otherGroup"]);
  });

  it("applies period, category and group together", () => {
    const got = filterLedger(
      entries,
      { period: "3m", category: "contribution", groupId: "g1" },
      NOW,
    );
    expect(got.map((e) => e.id)).toEqual(["recent"]);
  });

  it("returns nothing when the filters exclude everything", () => {
    const got = filterLedger(
      entries,
      { period: "3m", category: "distribution", groupId: "all" },
      NOW,
    );
    expect(got).toEqual([]);
  });
});

describe("summariseLedger", () => {
  it("separates incoming from outgoing rather than netting them", () => {
    const got = summariseLedger([
      entry({ id: "a", date: NOW, category: "contribution", amount: 500_000 }),
      entry({ id: "b", date: NOW, category: "distribution", amount: 1_200_000 }),
      entry({ id: "c", date: NOW, category: "fine", amount: 100_000 }),
    ]);
    expect(got).toEqual({ totalIn: 1_200_000, totalOut: 600_000, count: 3 });
  });

  it("reports zeroes for an empty ledger", () => {
    expect(summariseLedger([])).toEqual({ totalIn: 0, totalOut: 0, count: 0 });
  });
});

describe("search-param guards", () => {
  it("accepts only known periods", () => {
    expect(isLedgerPeriod("3m")).toBe(true);
    expect(isLedgerPeriod("all")).toBe(true);
    expect(isLedgerPeriod("7d")).toBe(false);
    expect(isLedgerPeriod(undefined)).toBe(false);
  });

  it("accepts only known categories", () => {
    expect(isLedgerCategory("repayment")).toBe(true);
    expect(isLedgerCategory("nonsense")).toBe(false);
    expect(isLedgerCategory(undefined)).toBe(false);
  });
});
