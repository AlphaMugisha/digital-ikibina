import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageGroup } from "@/lib/permissions";
import { getGroupWithMembership } from "@/lib/groups";
import { AddMemberDialog } from "./add-member-dialog";
import { MembersList, type MemberRow } from "./members-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return { title: `${t("members")} — Digital Ibimina` };
}

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  const canManage = canManageGroup(membership);

  const [locale, t, memberships, contributionTotals, activeLoanTotals, meetingCount, attendanceCounts, pendingInvitations] =
    await Promise.all([
      getLocale(),
      getTranslations("members"),
      prisma.membership.findMany({
        where: { groupId },
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { joinedAt: "asc" },
      }),
      prisma.contribution.groupBy({
        by: ["membershipId"],
        where: { membership: { groupId }, meeting: { date: { gte: group.cycleStart, lte: group.cycleEnd } } },
        _sum: { amount: true },
      }),
      prisma.loan.groupBy({
        by: ["membershipId"],
        where: { membership: { groupId }, status: "ACTIVE" },
        _sum: { amount: true },
      }),
      prisma.meeting.count({
        where: { groupId, date: { gte: group.cycleStart, lte: group.cycleEnd } },
      }),
      prisma.meetingAttendance.groupBy({
        by: ["membershipId"],
        where: {
          meeting: { groupId, date: { gte: group.cycleStart, lte: group.cycleEnd } },
          status: { in: ["PRESENT", "LATE"] },
        },
        _count: true,
      }),
      canManage
        ? prisma.invitation.findMany({
            where: { groupId, status: "PENDING" },
            include: { user: { select: { name: true, phone: true } } },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

  const contributedByMembership = new Map(
    contributionTotals.map((row) => [row.membershipId, row._sum.amount ?? 0]),
  );
  const activeLoanByMembership = new Map(
    activeLoanTotals.map((row) => [row.membershipId, row._sum.amount ?? 0]),
  );
  const attendedByMembership = new Map(attendanceCounts.map((row) => [row.membershipId, row._count]));

  const rows: MemberRow[] = memberships.map((m) => ({
    id: m.id,
    name: m.user.name,
    phone: m.user.phone,
    role: m.role,
    joinedAt: m.joinedAt.toISOString(),
    totalContributed: contributedByMembership.get(m.id) ?? 0,
    activeLoanAmount: activeLoanByMembership.get(m.id) ?? 0,
    meetingsAttended: attendedByMembership.get(m.id) ?? 0,
    meetingsTotal: meetingCount,
  }));

  return (
    <div>
      {canManage && (
        <div className="flex justify-end">
          <AddMemberDialog groupId={groupId} />
        </div>
      )}

      {canManage && pendingInvitations.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("pendingInvitationsTitle")}
          </h2>
          <ul className="mt-3 space-y-2">
            {pendingInvitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between rounded-xl border border-dashed border-border bg-card px-4 py-3"
              >
                <span className="truncate text-sm font-medium text-foreground">
                  {invitation.user.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t("invitedOn", {
                    date: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
                      invitation.createdAt,
                    ),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <MembersList groupId={groupId} rows={rows} canManage={canManage} />
      </div>
    </div>
  );
}
