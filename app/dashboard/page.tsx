import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/components/groups/group-card";
import { PiggyBankIllustration } from "@/components/illustrations/piggy-bank";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [locale, t, memberships, savings, pendingMeetings] = await Promise.all([
    getLocale(),
    getTranslations("dashboard"),
    prisma.membership.findMany({
      where: { userId },
      include: {
        group: {
          include: { _count: { select: { memberships: true } } },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.contribution.aggregate({
      where: { membership: { userId } },
      _sum: { amount: true },
    }),
    prisma.meeting.count({
      where: {
        group: { memberships: { some: { userId } } },
        contributions: { none: { membership: { userId } } },
      },
    }),
  ]);

  const firstName = (session.user.name ?? "").split(" ")[0] || "there";
  const today = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
    new Date(),
  );

  return (
    <div className="mx-auto max-w-2xl">
      {/* Greeting card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-6">
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          {t("greeting", { name: firstName })} 👋
        </h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {t("todayIs", { day: today })}
        </p>
      </div>

      {/* Summary tiles */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {t("savings")}
          </p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
            {formatRWF(savings._sum.amount ?? 0, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-accent/10 p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {t("groups")}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-accent-foreground">
            {memberships.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {t("pending")}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-foreground">
            {pendingMeetings}
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("yourGroups")}
      </h2>

      {memberships.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <PiggyBankIllustration className="h-40 w-auto" />
          <h3 className="mt-4 font-display font-semibold text-foreground">
            {t("noGroupsTitle")}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t("noGroupsSubtitle")}
          </p>
          <Button asChild className="mt-6 h-12 rounded-full text-base">
            <Link href="/dashboard/groups/new">
              <Plus className="size-5" aria-hidden="true" />
              {t("createGroup")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {memberships.map((m) => (
            <GroupCard
              key={m.id}
              group={m.group}
              memberCount={m.group._count.memberships}
              role={m.role}
            />
          ))}
        </div>
      )}
    </div>
  );
}
