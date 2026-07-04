import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGroupWithMembership } from "@/lib/groups";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GroupTabs } from "@/components/groups/group-tabs";

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  const [locale, tGroups, memberCount] = await Promise.all([
    getLocale(),
    getTranslations("groups"),
    prisma.membership.count({ where: { groupId } }),
  ]);
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs
        items={[
          { label: tGroups("title"), href: "/dashboard/groups" },
          { label: group.name },
        ]}
      />
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {group.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {tGroups("membersCount", { count: memberCount })}
      </p>
      <p className="text-sm text-muted-foreground">
        {tGroups("cycleRange", {
          start: dateFormatter.format(group.cycleStart),
          end: dateFormatter.format(group.cycleEnd),
        })}
      </p>

      <GroupTabs groupId={groupId} />

      <div className="mt-6">{children}</div>
    </div>
  );
}
