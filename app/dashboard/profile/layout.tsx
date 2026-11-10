import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getProfileUser, memberReference } from "@/lib/profile";
import { formatRwandanPhone } from "@/lib/phone";
import { ProfileNav } from "./profile-nav";

/**
 * Shared chrome for every profile section: the identity header and the section
 * nav. Rendering it here means switching sections never refetches it.
 */
export default async function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [locale, t, user] = await Promise.all([
    getLocale(),
    getTranslations("profile"),
    getProfileUser(session.user.id),
  ]);

  if (!user) redirect("/login");

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  const since = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(user.createdAt);

  const ibiminaLabel =
    user.membershipCount === 0
      ? t("ibiminaNone")
      : user.membershipCount === 1
        ? t("ibiminaOne")
        : t("ibiminaMany", { count: user.membershipCount });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="sr-only">{t("title")}</h1>

      {/* Identity header — one panel, deliberately short. Metadata sits in a
          definition list so screen readers get the label/value pairing. */}
      <header className="rounded-2xl border border-border bg-card p-5 shadow-warm-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-14 shrink-0 sm:size-16">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-display truncate text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                {user.name}
              </p>
              <p className="mt-0.5 truncate font-mono text-sm text-muted-foreground">
                {formatRwandanPhone(user.phone)}
              </p>
              <Badge
                variant="secondary"
                className="mt-2 gap-1.5 bg-success/10 text-success hover:bg-success/10"
              >
                <span
                  className="size-1.5 rounded-full bg-success"
                  aria-hidden="true"
                />
                {t("statusActive")}
              </Badge>
            </div>
          </div>

          <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-4 text-sm sm:grid-cols-1 sm:gap-y-2.5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 sm:text-right">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("memberId")}
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">
                {memberReference(user.id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("memberSince")}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{since}</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("tabIbimina")}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {ibiminaLabel}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <ProfileNav />

      <div className="mt-6">{children}</div>
    </div>
  );
}
