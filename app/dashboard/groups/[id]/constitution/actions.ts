"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/permissions";
import { createConstitutionRulesSchema } from "@/lib/schemas";
import type { ConstitutionSections } from "@/lib/constitution-template";
import { toCents } from "@/lib/money";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function composeContent(sections: ConstitutionSections): string {
  return [
    `## Intego\n\n${sections.purpose}`,
    `## Amasezerano y'imisanzu\n\n${sections.contributionAgreement}`,
    `## Amasezerano y'inama\n\n${sections.meetingRules}`,
    `## Amasezerano y'inguzanyo\n\n${sections.loanRules}`,
    `## Kugabana\n\n${sections.shareOutMethod}`,
    `## Impaka\n\n${sections.disputes}`,
  ].join("\n\n");
}

export async function saveConstitutionDraft(
  groupId: string,
  sections: ConstitutionSections,
  structuredRules: { latenessGraceDays: string; lateFeeType: string; lateFeeAmount: string; absenceFineAmount: string },
): Promise<ActionResult<{ id: string }>> {
  const [session, tValidation, tErrors] = await Promise.all([
    auth(),
    getTranslations("validation"),
    getTranslations("errors"),
  ]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  const parsed = createConstitutionRulesSchema(tValidation).safeParse(structuredRules);
  if (!parsed.success) {
    return { ok: false, error: tErrors("formInvalid") };
  }

  try {
    const membership = await getMembership(session.user.id, groupId);
    if (membership?.role !== "LEADER") {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    const content = composeContent(sections);
    const lateFeeAmountCents =
      parsed.data.lateFeeType === "FIXED" ? toCents(parsed.data.lateFeeAmount) : Math.round(Number(parsed.data.lateFeeAmount) * 100);

    const constitution = await prisma.groupConstitution.upsert({
      where: { groupId },
      create: {
        groupId,
        content,
        latenessGraceDays: Number(parsed.data.latenessGraceDays),
        lateFeeType: parsed.data.lateFeeType,
        lateFeeAmount: lateFeeAmountCents,
        absenceFineAmount: toCents(structuredRules.absenceFineAmount),
      },
      update: {
        content,
        latenessGraceDays: Number(parsed.data.latenessGraceDays),
        lateFeeType: parsed.data.lateFeeType,
        lateFeeAmount: lateFeeAmountCents,
        absenceFineAmount: toCents(structuredRules.absenceFineAmount),
      },
      select: { id: true },
    });

    revalidatePath(`/dashboard/groups/${groupId}/constitution/edit`);
    return { ok: true, data: { id: constitution.id } };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}

export async function publishConstitution(groupId: string): Promise<ActionResult<{ version: number }>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }
  const userId = session.user.id;

  try {
    const membership = await getMembership(userId, groupId);
    if (membership?.role !== "LEADER") {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    return await prisma.$transaction(async (tx) => {
      const constitution = await tx.groupConstitution.findUnique({ where: { groupId } });
      if (!constitution) {
        return { ok: false, error: tErrors("noConstitutionDraft") };
      }

      const newVersion = constitution.publishedAt ? constitution.version + 1 : constitution.version;

      await tx.groupConstitution.update({
        where: { groupId },
        data: { version: newVersion, publishedAt: new Date() },
      });

      await tx.constitutionRevision.create({
        data: {
          constitutionId: constitution.id,
          version: newVersion,
          content: constitution.content,
          editedBy: userId,
        },
      });

      revalidatePath(`/dashboard/groups/${groupId}/constitution`);
      revalidatePath(`/dashboard/groups/${groupId}`);
      return { ok: true, data: { version: newVersion } };
    }, { maxWait: 10_000, timeout: 15_000 });
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}

export async function agreeToConstitution(groupId: string, version: number): Promise<ActionResult<null>> {
  const [session, tErrors] = await Promise.all([auth(), getTranslations("errors")]);
  if (!session?.user?.id) {
    return { ok: false, error: tErrors("notAuthorized") };
  }

  try {
    const membership = await getMembership(session.user.id, groupId);
    if (!membership) {
      return { ok: false, error: tErrors("notGroupMember") };
    }

    const constitution = await prisma.groupConstitution.findUnique({ where: { groupId } });
    if (!constitution) {
      return { ok: false, error: tErrors("notAuthorized") };
    }

    await prisma.constitutionAgreement.createMany({
      data: [{ constitutionId: constitution.id, membershipId: membership.id, version }],
      skipDuplicates: true,
    });

    revalidatePath(`/dashboard/groups/${groupId}/constitution`);
    revalidatePath(`/dashboard/groups/${groupId}`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: tErrors("actionFailed") };
  }
}
