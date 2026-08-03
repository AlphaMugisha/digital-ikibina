"use server";

import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/permissions";
import { toCents } from "@/lib/money";
import { createGroupPoliciesSchema, type GroupPoliciesValues } from "@/lib/schemas";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateGroupPolicies(
  groupId: string,
  values: GroupPoliciesValues,
): Promise<ActionResult> {
  const [session, tValidation, tErrors] = await Promise.all([
    auth(),
    getTranslations("validation"),
    getTranslations("errors"),
  ]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const parsed = createGroupPoliciesSchema(tValidation).safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  const membership = await getMembership(session.user.id, groupId);
  if (membership?.role !== "LEADER") {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  try {
    await prisma.group.update({
      where: { id: groupId },
      data: {
        minContributionAmount: toCents(parsed.data.minContributionAmount),
        maxContributionAmount: toCents(parsed.data.maxContributionAmount),
        maxLoanMultiplier: Number(parsed.data.maxLoanMultiplier),
        maxLoanDurationDays: Number(parsed.data.maxLoanDurationDays),
        requireGuarantor: parsed.data.requireGuarantor,
        requireApproval: parsed.data.requireApproval,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}
