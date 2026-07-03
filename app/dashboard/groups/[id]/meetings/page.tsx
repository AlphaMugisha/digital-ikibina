import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarPlus, ChevronRight, ClipboardList } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { canManageGroup } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meetings");
  return { title: `${t("title")} — Digital Ibimina` };
}

export default async function MeetingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
    include: { group: true },
  });
  if (!membership) notFound();

  const [locale, t, tGroups, meetings] = await Promise.all([
    getLocale(),
    getTranslations("meetings"),
    getTranslations("groups"),
    prisma.meeting.findMany({
      where: { groupId },
      orderBy: { date: "desc" },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs
        items={[
          { label: tGroups("title"), href: "/dashboard/groups" },
          { label: membership.group.name, href: `/dashboard/groups/${groupId}` },
          { label: t("title") },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          {t("title")}
        </h1>
        {canManageGroup(membership) && (
          <Button asChild className="h-11 rounded-full">
            <Link href={`/dashboard/groups/${groupId}/meetings/new`}>
              <CalendarPlus className="size-5" aria-hidden="true" />
              {t("startMeeting")}
            </Link>
          </Button>
        )}
      </div>

      {meetings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ClipboardList}
            title={t("noMeetingsTitle")}
            subtitle={t("noMeetingsSubtitle")}
            action={
              canManageGroup(membership) && (
                <Button asChild className="h-12 rounded-full text-base">
                  <Link href={`/dashboard/groups/${groupId}/meetings/new`}>
                    <CalendarPlus className="size-5" aria-hidden="true" />
                    {t("startMeeting")}
                  </Link>
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {meetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/dashboard/groups/${groupId}/meetings/${meeting.id}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-warm-sm transition-all hover:-translate-y-0.5 hover:shadow-warm-lg"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-foreground">
                  {dateFormatter.format(meeting.date)}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {formatRWF(meeting.totalCollected, locale)}
                </p>
                {meeting.notes && (
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {meeting.notes}
                  </p>
                )}
              </div>
              <ChevronRight
                className="size-5 shrink-0 text-muted-foreground/50"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
