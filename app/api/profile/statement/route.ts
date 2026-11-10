import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { fromCents } from "@/lib/money";
import { getLedger } from "@/lib/profile";
import {
  filterLedger,
  isLedgerCategory,
  isLedgerPeriod,
} from "@/lib/profile-ledger";

/** RFC 4180 escaping: quote the field and double any embedded quotes. */
function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * CSV statement of the signed-in member's own ledger.
 *
 * The user id comes from the session, so this endpoint cannot be pointed at
 * another member's records. It honours the same filters as the Activity page.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const periodParam = params.get("period") ?? undefined;
  const categoryParam = params.get("category") ?? undefined;
  const groupParam = params.get("group");

  // ISO dates and raw numbers throughout: a statement is opened in a
  // spreadsheet and summed, so it must not be locale-formatted.
  const ledger = await getLedger(session.user.id);

  const entries = filterLedger(
    ledger,
    {
      period: isLedgerPeriod(periodParam) ? periodParam : "12m",
      category: isLedgerCategory(categoryParam) ? categoryParam : "all",
      groupId: groupParam && groupParam !== "all" ? groupParam : "all",
    },
    new Date(),
  );

  // Amounts go out as plain RWF numbers, not formatted currency — a statement
  // is meant to be opened in a spreadsheet and summed.
  const header = ["Date", "Type", "Direction", "Ikimina", "Amount (RWF)", "Status", "Note"];
  const rows = entries.map((entry) => [
    entry.date.toISOString().slice(0, 10),
    entry.category,
    entry.direction === "in" ? "received" : "paid",
    entry.groupName,
    fromCents(entry.amount),
    entry.status ?? "",
    entry.note ?? "",
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  // BOM so Excel reads the UTF-8 group names (and Kinyarwanda notes) correctly.
  const body = `﻿${csv}\r\n`;
  const filename = `ikibina-statement-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
