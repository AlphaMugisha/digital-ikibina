import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGroupWithMembership } from "@/lib/groups";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SimpleMarkdown } from "@/components/constitution/simple-markdown";
import { AgreeButton } from "./agree-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("constitution");
  return { title: `${t("title")} — Digital Ibimina` };
}

export default async function ConstitutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  const [locale, t, constitution] = await Promise.all([
    getLocale(),
    getTranslations("constitution"),
    prisma.groupConstitution.findUnique({ where: { groupId } }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });
  const isLeader = membership.role === "LEADER";

  if (!constitution || !constitution.publishedAt) {
    return (
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs items={[{ label: t("title") }]} />
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t("noRulesYet")}</p>
        {isLeader && (
          <Link
            href={`/dashboard/groups/${groupId}/constitution/edit`}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("editRules")}
          </Link>
        )}
      </div>
    );
  }

  const [myAgreement, editor, revisions] = await Promise.all([
    prisma.constitutionAgreement.findFirst({
      where: { constitutionId: constitution.id, membershipId: membership.id },
      orderBy: { version: "desc" },
    }),
    prisma.constitutionRevision.findFirst({
      where: { constitutionId: constitution.id, version: constitution.version },
      select: { editedBy: true },
    }),
    prisma.constitutionRevision.findMany({
      where: { constitutionId: constitution.id },
      orderBy: { version: "desc" },
      select: { version: true, editedAt: true },
    }),
  ]);

  const editorUser = editor
    ? await prisma.user.findUnique({ where: { id: editor.editedBy }, select: { name: true } })
    : null;

  const needsToAgree = myAgreement?.version !== constitution.version;

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs items={[{ label: t("title") }]} />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">{t("title")}</h1>
        {isLeader && (
          <Link
            href={`/dashboard/groups/${groupId}/constitution/edit`}
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            {t("editRules")}
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("versionLabel", { version: constitution.version })} ·{" "}
        {t("lastUpdated", {
          date: dateFormatter.format(constitution.updatedAt),
          name: editorUser?.name ?? "",
        })}
      </p>

      {needsToAgree && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-destructive">{t("needsAgreementBanner")}</p>
          <div className="mt-3">
            <AgreeButton groupId={groupId} version={constitution.version} />
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-warm-sm">
        <SimpleMarkdown content={constitution.content} />
      </div>

      {revisions.length > 1 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("historyTitle")}
          </h2>
          <ul className="mt-3 space-y-2">
            {revisions.map((r) => (
              <li
                key={r.version}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="text-foreground">{t("versionLabel", { version: r.version })}</span>
                <span className="text-muted-foreground">{dateFormatter.format(r.editedAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
