import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/components/groups/group-card";

export const metadata: Metadata = {
  title: "Amatsinda / Groups — Digital Ibimina",
};

export default async function GroupsPage() {
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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          Amatsinda / Groups
        </h1>
        {/* Desktop: regular button; mobile uses the floating button below */}
        <Button asChild className="hidden h-11 rounded-full md:inline-flex">
          <Link href="/dashboard/groups/new">
            <Plus className="size-5" aria-hidden="true" />
            Kora itsinda rishya / Create new group
          </Link>
        </Button>
      </div>

      {memberships.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="size-8" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display font-semibold text-foreground">
            Nta tsinda ufite / You have no groups yet
          </h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Kanda buto yo hepfo ukore itsinda ryawe rya mbere.
          </p>
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

      {/* Mobile floating action button, above the floating bottom nav */}
      <Button
        asChild
        size="icon"
        aria-label="Kora itsinda rishya / Create new group"
        className="fixed bottom-24 right-4 z-30 size-14 rounded-full shadow-warm-lg md:hidden"
      >
        <Link href="/dashboard/groups/new">
          <Plus className="size-6" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
