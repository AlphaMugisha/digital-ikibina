"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCents } from "@/lib/money";
import { createGroupFormSchema, type GroupFormValues } from "@/lib/schemas";

export async function createGroup(
  values: GroupFormValues,
): Promise<{ error: string } | undefined> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [tValidation, tErrors] = await Promise.all([
    getTranslations("validation"),
    getTranslations("errors"),
  ]);

  const parsed = createGroupFormSchema(tValidation).safeParse(values);
  if (!parsed.success) {
    return { error: tErrors("formInvalid") };
  }

  let groupId: string;
  try {
    // Nested create = one atomic transaction: the group is never created
    // without its LEADER membership.
    const group = await prisma.group.create({
      data: {
        name: parsed.data.name,
        contributionAmount: toCents(parsed.data.contributionAmount),
        meetingDay: Number(parsed.data.meetingDay),
        // percentage → basis points (5 → 500)
        interestRate: Math.round(Number(parsed.data.interestRate) * 100),
        cycleStart: new Date(parsed.data.cycleStart),
        cycleEnd: new Date(parsed.data.cycleEnd),
        memberships: {
          create: {
            userId: session.user.id,
            role: "LEADER",
          },
        },
      },
      select: { id: true },
    });
    groupId = group.id;
  } catch {
    return { error: tErrors("groupCreateFailed") };
  }

  redirect(`/dashboard/groups/${groupId}`);
}
