import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getGroupWithMembership } from "@/lib/groups";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GroupPoliciesForm } from "./group-policies-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans");
  return { title: `${t("settingsTitle")} — Digital Ibimina` };
}

export default async function GroupSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  // Only the leader may view or change loan policies.
  if (membership.role !== "LEADER") {
    redirect(`/dashboard/groups/${groupId}`);
  }

  const t = await getTranslations("loans");

  return (
    <div className="mx-auto max-w-2xl">
      {/* The [id] layout already shows "Groups > {group name}" above this */}
      <Breadcrumbs
        items={[{ label: t("settingsTitle") }]}
      />
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {t("settingsTitle")}
      </h1>

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("loanPolicies")}
        </h2>
        <div className="mt-4">
          <GroupPoliciesForm
            groupId={groupId}
            defaultValues={{
              maxLoanMultiplier: String(group.maxLoanMultiplier),
              maxLoanDurationDays: String(group.maxLoanDurationDays),
              requireGuarantor: group.requireGuarantor,
              requireApproval: group.requireApproval,
            }}
          />
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 p-4">
        <h2 className="text-sm font-semibold text-destructive">{t("dangerZone")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("dangerZoneHint")}</p>
      </div>
    </div>
  );
}
