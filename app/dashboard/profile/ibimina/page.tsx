import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronRight } from "@/components/icons";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { PiggyBankIllustration } from "@/components/illustrations/piggy-bank";
import { Button } from "@/components/ui/button";
import { getProfileMemberships } from "@/lib/profile";
import type { Role } from "@prisma/client";

export default async function ProfileIbiminaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [locale, t, tGroups, memberships] = await Promise.all([
    getLocale(),
    getTranslations("profile"),
    getTranslations("groups"),
    getProfileMemberships(session.user.id),
  ]);

  const roleLabel: Record<Role, string> = {
    LEADER: tGroups("roleLeader"),
    SECRETARY: tGroups("roleSecretary"),
    MEMBER: tGroups("roleMember"),
  };

  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (memberships.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-10 text-center shadow-warm-sm">
        <PiggyBankIllustration className="mx-auto h-28 w-auto" />
        <h2 className="font-display mt-6 text-lg font-medium tracking-tight text-foreground">
          {t("noIbimina")}
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {t("noIbiminaHint")}
        </p>
        <Button asChild className="mt-6 h-11 rounded-full px-6">
          <Link href="/dashboard/groups/new">{tGroups("createNew")}</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card shadow-warm-sm">
      <div className="border-b border-border p-5 sm:p-6">
        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
          {t("ibiminaTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("ibiminaSubtitle")}</p>
      </div>

      <ul className="divide-y divide-border">
        {memberships.map((m) => (
          <li key={m.membershipId}>
            <Link
              href={`/dashboard/groups/${m.groupId}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/60 focus-visible:bg-secondary/60 focus-visible:outline-none sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display truncate font-medium text-foreground">
                    {m.groupName}
                  </span>
                  <Badge
                    variant={m.role === "MEMBER" ? "secondary" : "default"}
                    className="shrink-0 text-[10px] tracking-wide"
                  >
                    {roleLabel[m.role]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("joinedOn", { date: dateFmt.format(m.joinedAt) })}
                  {" · "}
                  {t("memberCount", { count: m.memberCount })}
                  {" · "}
                  {t("cycleNumber", { number: m.cycleNumber })}
                </p>
              </div>
              <ChevronRight
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">{t("openGroup")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
