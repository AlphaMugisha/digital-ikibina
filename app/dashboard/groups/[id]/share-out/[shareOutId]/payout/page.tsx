import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PayoutList } from "./payout-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shareout");
  return { title: `${t("payoutTitle")} — Digital Ibimina` };
}

export default async function PayoutPage({
  params,
}: {
  params: Promise<{ id: string; shareOutId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId, shareOutId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });
  if (membership?.role !== "LEADER") {
    redirect(`/dashboard/groups/${groupId}/share-out/${shareOutId}`);
  }

  const shareOut = await prisma.shareOut.findUnique({
    where: { id: shareOutId },
    include: {
      allocations: {
        include: { membership: { include: { user: { select: { name: true } } } } },
        orderBy: { finalPayout: "desc" },
      },
    },
  });
  if (!shareOut || shareOut.groupId !== groupId) notFound();
  if (shareOut.status !== "FINALIZED" && shareOut.status !== "COMPLETED") {
    redirect(`/dashboard/groups/${groupId}/share-out/${shareOutId}`);
  }

  const [locale, t] = await Promise.all([getLocale(), getTranslations("shareout")]);
  const previousCycleDays = Math.max(
    1,
    Math.round((shareOut.cycleEnd.getTime() - shareOut.cycleStart.getTime()) / 86_400_000),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs
        items={[
          { label: t("title"), href: `/dashboard/groups/${groupId}/share-out` },
          { label: t("payoutTitle") },
        ]}
      />
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {t("payoutTitle")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatRWF(shareOut.totalPool, locale)}
      </p>

      <div className="mt-4">
        <PayoutList
          shareOutId={shareOut.id}
          groupId={groupId}
          status={shareOut.status}
          previousCycleDays={previousCycleDays}
          previousCycleEnd={shareOut.cycleEnd.toISOString()}
          allocations={shareOut.allocations.map((a) => ({
            id: a.id,
            name: a.membership.user.name,
            finalPayout: a.finalPayout,
            status: a.status,
          }))}
          locale={locale}
        />
      </div>
    </div>
  );
}
