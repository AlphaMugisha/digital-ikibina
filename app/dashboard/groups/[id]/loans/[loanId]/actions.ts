"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCents } from "@/lib/money";
import { calculateAmountOwed } from "@/lib/loans";
import { createRecordPaymentSchema } from "@/lib/schemas";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function recordLoanPayment(
  loanId: string,
  amount: string,
  paidAt: string,
  note: string,
): Promise<ActionResult<{ remaining: number; isPaid: boolean }>> {
  const [session, tValidation, tErrors] = await Promise.all([
    auth(),
    getTranslations("validation"),
    getTranslations("errors"),
  ]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  const parsed = createRecordPaymentSchema(tValidation).safeParse({ amount, paidAt, note });
  if (!parsed.success) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  const parsedPaidAt = new Date(parsed.data.paidAt);
  if (parsedPaidAt.getTime() > Date.now()) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  let amountCents: number;
  try {
    amountCents = toCents(parsed.data.amount);
  } catch {
    return { ok: false, error: tErrors("invalidAmount") };
  }
  if (amountCents <= 0) {
    return { ok: false, error: tErrors("invalidAmount") };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        select: {
          id: true,
          amount: true,
          interestRate: true,
          takenAt: true,
          status: true,
          lateFeesAccrued: true,
          membership: { select: { groupId: true } },
        },
      });
      if (!loan) {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      const membership = await tx.membership.findUnique({
        where: { userId_groupId: { userId, groupId: loan.membership.groupId } },
      });
      if (membership?.role !== "LEADER" && membership?.role !== "SECRETARY") {
        return { ok: false, error: tErrors("notAuthorized") };
      }

      if (loan.status !== "ACTIVE") {
        return { ok: false, error: tErrors("loanNotActive") };
      }

      // Deliberately NOT blocked by an active share-out: paying down an
      // ACTIVE loan only shrinks its carried-forward deduction, which is
      // exactly what a leader wants to encourage during a share-out.

      const existingPayments = await tx.loanPayment.findMany({
        where: { loanId },
        select: { amount: true },
      });

      const owedNow = calculateAmountOwed(loan, existingPayments, new Date()).totalOwed;
      if (amountCents > owedNow) {
        return { ok: false, error: tErrors("amountExceedsOwed") };
      }

      await tx.loanPayment.create({
        data: {
          loanId,
          amount: amountCents,
          note: parsed.data.note.trim() || null,
          paidAt: parsedPaidAt,
        },
      });

      const owedAfter = calculateAmountOwed(
        loan,
        [...existingPayments, { amount: amountCents }],
        parsedPaidAt,
      ).totalOwed;

      const isPaid = owedAfter <= 0;
      if (isPaid) {
        await tx.loan.update({ where: { id: loanId }, data: { status: "PAID" } });
      }

      revalidatePath(`/dashboard/groups/${loan.membership.groupId}/loans/${loanId}`);
      return { ok: true, data: { remaining: owedAfter, isPaid } };
    }, { maxWait: 10_000, timeout: 15_000 });
  } catch {
    return { ok: false, error: tErrors("loanActionFailed") };
  }
}
