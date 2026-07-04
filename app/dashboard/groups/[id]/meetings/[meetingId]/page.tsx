import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMembership, canManageGroup } from "@/lib/permissions";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MeetingRecorder, type MemberRowData } from "./meeting-recorder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}): Promise<Metadata> {
  const { meetingId } = await params;
  const [t, meeting] = await Promise.all([
    getTranslations("meetings"),
    prisma.meeting.findUnique({ where: { id: meetingId }, select: { date: true } }),
  ]);
  const date = meeting ? meeting.date.toISOString().slice(0, 10) : "";
  return { title: `${t("meetingOn", { date })} — Digital Ibimina` };
}

export default async function MeetingRecordingPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId, meetingId } = await params;

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { group: true },
  });
  if (!meeting || meeting.groupId !== groupId) notFound();

  const membership = await getMembership(session.user.id, groupId);
  if (!membership) notFound();

  const [locale, t, memberships, contributions] = await Promise.all([
    getLocale(),
    getTranslations("meetings"),
    prisma.membership.findMany({
      where: { groupId },
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.contribution.findMany({ where: { meetingId } }),
  ]);

  const contributionByMembership = new Map(
    contributions.map((c) => [c.membershipId, c]),
  );

  const members: MemberRowData[] = memberships.map((m) => {
    const contribution = contributionByMembership.get(m.id);
    return {
      membershipId: m.id,
      name: m.user.name,
      phoneLast4: m.user.phone.slice(-4),
      amountCents: contribution?.amount ?? 0,
      note: contribution?.note ?? "",
    };
  });

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateLabel = dateFormatter.format(meeting.date);

  return (
    <div>
      {/* The [id] layout already shows "Groups > {group name}" above this */}
      <Breadcrumbs
        items={[
          { label: t("title"), href: `/dashboard/groups/${groupId}/meetings` },
          { label: dateLabel },
        ]}
      />
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {dateLabel}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("membersRecorded")}: {members.length}
      </p>

      <div className="mt-6">
        <MeetingRecorder
          meetingId={meetingId}
          groupId={groupId}
          members={members}
          defaultAmountCents={meeting.group.contributionAmount}
          locale={locale}
          canManage={canManageGroup(membership)}
        />
      </div>
    </div>
  );
}
