import { describe, expect, it } from "vitest";
import {
  formatRwandanPhone,
  isValidRwandanPhone,
  maskNationalId,
  normalizeRwandanPhone,
} from "./phone";

describe("normalizeRwandanPhone", () => {
  it("accepts the three shapes a Rwandan user might type", () => {
    expect(normalizeRwandanPhone("+250788123456")).toBe("+250788123456");
    expect(normalizeRwandanPhone("250788123456")).toBe("+250788123456");
    expect(normalizeRwandanPhone("0788123456")).toBe("+250788123456");
  });

  it("tolerates spaces and dashes", () => {
    expect(normalizeRwandanPhone("078 812 3456")).toBe("+250788123456");
    expect(normalizeRwandanPhone("078-812-3456")).toBe("+250788123456");
  });

  it("rejects anything that is not a Rwandan mobile number", () => {
    expect(normalizeRwandanPhone("0688123456")).toBeNull();
    expect(normalizeRwandanPhone("078812345")).toBeNull();
    expect(normalizeRwandanPhone("")).toBeNull();
  });
});

describe("formatRwandanPhone", () => {
  it("groups a stored E.164 number for display", () => {
    expect(formatRwandanPhone("+250788123456")).toBe("+250 788 123 456");
    expect(formatRwandanPhone("+250722000111")).toBe("+250 722 000 111");
  });

  it("returns anything unrecognised unchanged, so it is safe on legacy rows", () => {
    expect(formatRwandanPhone("+1 555 0100")).toBe("+1 555 0100");
    expect(formatRwandanPhone("")).toBe("");
  });

  it("round-trips with normalize", () => {
    const stored = normalizeRwandanPhone("0788123456")!;
    expect(isValidRwandanPhone(stored)).toBe(true);
    expect(formatRwandanPhone(stored)).toBe("+250 788 123 456");
  });
});

describe("maskNationalId", () => {
  it("reveals only the last four digits", () => {
    expect(maskNationalId("1199070123456789")).toBe("•••• •••• •••• 6789");
  });

  it("returns null when no ID is on record, so callers can show their own copy", () => {
    expect(maskNationalId(null)).toBeNull();
  });

  it("never leaks a short or malformed value", () => {
    expect(maskNationalId("12")).toBe("••••");
    expect(maskNationalId("abc")).toBe("••••");
  });
});
