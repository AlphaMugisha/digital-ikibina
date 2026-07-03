import { notFound, redirect } from "next/navigation";
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-emerald-950">
        {group.name}
      </h1>
      <p className="mt-1 font-mono text-sm text-emerald-700">
        {formatRWF(group.contributionAmount)}
        <span className="font-sans text-slate-400"> / icyumweru</span>
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {meetingDayLabel(group.meetingDay)}
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        Imisanzu n&apos;inguzanyo biraza vuba / Coming in Session 3
      </div>
    </div>
  );
}
