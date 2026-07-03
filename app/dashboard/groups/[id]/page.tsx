import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { meetingDayLabel } from "@/lib/days";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  // Only members of the group may view it.
  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId: id } },
    include: { group: true },
  });
  if (!membership) notFound();

  const { group } = membership;
  const [locale, t] = await Promise.all([getLocale(), getTranslations("groups")]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {group.name}
      </h1>
      <p className="mt-1 text-sm font-semibold text-primary">
        {formatRWF(group.contributionAmount, locale)}
        <span className="font-normal text-muted-foreground"> {t("perWeek")}</span>
      </p>
      <p className="mt-1 text-sm capitalize text-muted-foreground">
        {meetingDayLabel(group.meetingDay, locale)}
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        {t("comingSoon")}
      </div>
    </div>
  );
}
