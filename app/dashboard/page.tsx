import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/components/groups/group-card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: { _count: { select: { memberships: true } } },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const firstName = (session.user.name ?? "").split(" ")[0] || "mugenzi";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-emerald-950">
        Muraho, {firstName}!
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Dore amatsinda yawe / Here are your groups.
      </p>

      {memberships.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Users className="size-8" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-semibold text-emerald-950">
            Nta tsinda ufite / You have no groups yet
          </h2>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Tangira ukore itsinda ryawe rya mbere — bifata umunota umwe.
          </p>
          <Button asChild className="mt-6 h-12 text-base">
            <Link href="/dashboard/groups/new">
              <Plus className="size-5" aria-hidden="true" />
              Kora itsinda / Create a group
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
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
