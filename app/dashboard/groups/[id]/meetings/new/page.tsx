import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { canManageGroup } from "@/lib/permissions";
import { getGroupWithMembership } from "@/lib/groups";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MeetingForm } from "./meeting-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meetings");
  return { title: `${t("startTitle")} — Digital Ibimina` };
}

export default async function NewMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  // Only LEADER/SECRETARY may start a meeting — send everyone else back to the list.
  if (!canManageGroup(membership)) {
    redirect(`/dashboard/groups/${groupId}/meetings`);
  }

  const t = await getTranslations("meetings");

  return (
    <div className="mx-auto max-w-md">
      {/* The [id] layout already shows "Groups > {group name}" above this */}
      <Breadcrumbs
        items={[
          { label: t("title"), href: `/dashboard/groups/${groupId}/meetings` },
          { label: t("startTitle") },
        ]}
      />
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {t("startTitle")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("startSubtitle")}</p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-warm-sm">
        <MeetingForm groupId={groupId} />
      </div>
    </div>
  );
}
