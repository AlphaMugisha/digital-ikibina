import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getGroupWithMembership } from "@/lib/groups";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DEFAULT_CONSTITUTION_TEMPLATE } from "@/lib/constitution-template";
import { ConstitutionEditorForm } from "./constitution-editor-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("constitution");
  return { title: `${t("editRules")} — Digital Ibimina` };
}

function extractSection(content: string, header: string, fallback: string): string {
  const marker = `## ${header}`;
  const idx = content.indexOf(marker);
  if (idx === -1) return fallback;
  const rest = content.slice(idx + marker.length);
  const nextIdx = rest.indexOf("\n## ");
  const body = nextIdx === -1 ? rest : rest.slice(0, nextIdx);
  return body.trim();
}

export default async function ConstitutionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();
  if (membership.role !== "LEADER") {
    redirect(`/dashboard/groups/${groupId}/constitution`);
  }

  const [t, constitution] = await Promise.all([
    getTranslations("constitution"),
    prisma.groupConstitution.findUnique({ where: { groupId } }),
  ]);

  const sections = constitution
    ? {
        purpose: extractSection(constitution.content, "Intego", ""),
        contributionAgreement: extractSection(constitution.content, "Amasezerano y'imisanzu", ""),
        meetingRules: extractSection(constitution.content, "Amasezerano y'inama", ""),
        loanRules: extractSection(constitution.content, "Amasezerano y'inguzanyo", ""),
        shareOutMethod: extractSection(constitution.content, "Kugabana", ""),
        disputes: extractSection(constitution.content, "Impaka", ""),
      }
    : DEFAULT_CONSTITUTION_TEMPLATE;

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <Breadcrumbs
        items={[
          { label: t("title"), href: `/dashboard/groups/${groupId}/constitution` },
          { label: t("editRules") },
        ]}
      />
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {t("editRules")}
      </h1>
      {!constitution && (
        <p className="mt-1 text-sm text-muted-foreground">{t("defaultTemplateNotice")}</p>
      )}

      <div className="mt-6">
        <ConstitutionEditorForm
          groupId={groupId}
          sections={sections}
          structuredRules={{
            latenessGraceDays: String(constitution?.latenessGraceDays ?? 0),
            lateFeeType: constitution?.lateFeeType ?? "NONE",
            lateFeeAmount:
              constitution?.lateFeeType === "PERCENT"
                ? String((constitution.lateFeeAmount / 100).toFixed(2))
                : String((constitution?.lateFeeAmount ?? 0) / 100),
            absenceFineAmount: String((constitution?.absenceFineAmount ?? 0) / 100),
          }}
          isPublished={Boolean(constitution?.publishedAt)}
        />
      </div>
    </div>
  );
}
