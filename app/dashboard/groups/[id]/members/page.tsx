import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { canManageGroup } from "@/lib/permissions";
import { getGroupWithMembership } from "@/lib/groups";
import { Badge } from "@/components/ui/badge";
import { AddMemberDialog } from "./add-member-dialog";
import { RoleMenu } from "./role-menu";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return { title: `${t("members")} — Digital Ibimina` };
}

const ROLE_BADGE: Record<string, string> = {
  LEADER: "bg-primary/10 text-primary",
  SECRETARY: "bg-accent/20 text-accent-foreground",
  MEMBER: "bg-secondary text-muted-foreground",
};

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

  const [locale, t, tGroups, memberships, contributionTotals, activeLoanTotals] =
    await Promise.all([
      getLocale(),
      getTranslations("members"),
      getTranslations("groups"),
      prisma.membership.findMany({
        where: { groupId },
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { joinedAt: "asc" },
      }),
      prisma.contribution.groupBy({
        by: ["membershipId"],
        where: { membership: { groupId } },
        _sum: { amount: true },
      }),
      prisma.loan.groupBy({
        by: ["membershipId"],
        where: { membership: { groupId }, status: "ACTIVE" },
        _sum: { amount: true },
      }),
    ]);

  const contributedByMembership = new Map(
    contributionTotals.map((row) => [row.membershipId, row._sum.amount ?? 0]),
  );
  const activeLoanByMembership = new Map(
    activeLoanTotals.map((row) => [row.membershipId, row._sum.amount ?? 0]),
  );

  const canManage = canManageGroup(membership);

  return (
    <div>
      {canManage && (
        <div className="flex justify-end">
          <AddMemberDialog groupId={groupId} />
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {memberships.map((m) => {
          const totalContributed = contributedByMembership.get(m.id) ?? 0;
          const activeLoanAmount = activeLoanByMembership.get(m.id) ?? 0;

          return (
            <li key={m.id}>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-warm-sm">
                <Link
                  href={`/dashboard/groups/${groupId}/members/${m.id}`}
                  className="min-w-0 flex-1"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium text-foreground">
                      {m.user.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`rounded-full border-none font-semibold ${ROLE_BADGE[m.role]}`}
                    >
                      {tGroups(
                        `role${m.role.charAt(0)}${m.role.slice(1).toLowerCase()}` as "roleLeader",
                      )}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("totalContributed")}:{" "}
                    <span className="font-semibold text-primary">
                      {formatRWF(totalContributed, locale)}
                    </span>
                    {activeLoanAmount > 0 && (
                      <span className="ml-2 text-destructive">
                        · {t("activeLoanAmount")}: {formatRWF(activeLoanAmount, locale)}
                      </span>
                    )}
                  </p>
                </Link>
                {canManage && m.role !== "LEADER" && (
                  <RoleMenu groupId={groupId} membershipId={m.id} currentRole={m.role} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
