import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { HandCoins } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { EmptyState } from "@/components/empty-state";
import { ShareOutStatusBadge } from "@/components/shareout/shareout-status-badge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shareout");
  return { title: `${t("personalTitle")} — Digital Ibimina` };
}

export default async function PersonalShareOutsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [locale, t, allocations] = await Promise.all([
    getLocale(),
    getTranslations("shareout"),
    prisma.shareOutAllocation.findMany({
      where: { membership: { userId: session.user.id } },
      include: {
        shareOut: {
          select: { status: true, cycleStart: true, cycleEnd: true, group: { select: { id: true, name: true } } },
        },
      },
      orderBy: { shareOut: { cycleStart: "desc" } },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  const lifetimeContributed = allocations.reduce((sum, a) => sum + a.totalContributed, 0);
  const lifetimeInterest = allocations.reduce((sum, a) => sum + a.interestShare, 0);
  const lifetimePayouts = allocations
    .filter((a) => a.status === "PAID")
    .reduce((sum, a) => sum + a.finalPayout, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {t("personalTitle")}
      </h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("personalLifetimeContributed")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-primary">
            {formatRWF(lifetimeContributed, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-accent/10 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("personalLifetimeInterest")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-accent-foreground">
            {formatRWF(lifetimeInterest, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("personalLifetimePayouts")}</p>
          <p className="mt-1 truncate font-display text-lg font-semibold text-foreground">
            {formatRWF(lifetimePayouts, locale)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {allocations.length === 0 ? (
          <EmptyState icon={HandCoins} title={t("noPersonalShareOutsYet")} subtitle="" />
        ) : (
          <ul className="space-y-2">
            {allocations.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/dashboard/groups/${a.shareOut.group.id}/share-out`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.shareOut.group.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("cycleDates", {
                        start: dateFormatter.format(a.shareOut.cycleStart),
                        end: dateFormatter.format(a.shareOut.cycleEnd),
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-primary">
                      {formatRWF(a.finalPayout, locale)}
                    </span>
                    <ShareOutStatusBadge status={a.shareOut.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
