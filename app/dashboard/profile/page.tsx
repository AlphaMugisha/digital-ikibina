import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getProfileUser } from "@/lib/profile";
import { formatRwandanPhone, maskNationalId } from "@/lib/phone";
import { isLocale } from "@/i18n/config";
import { PersonalInfoForm } from "./personal-info-form";

export default async function ProfileOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [t, user] = await Promise.all([
    getTranslations("profile"),
    getProfileUser(session.user.id),
  ]);

  if (!user) redirect("/login");

  const maskedId = maskNationalId(user.nationalId);

  /** Fields a member cannot change themselves — shown, but not editable. */
  const locked = [
    { label: t("phoneLabel"), value: formatRwandanPhone(user.phone), mono: true },
    { label: t("nationalIdLabel"), value: maskedId, mono: true },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card shadow-warm-sm">
      <div className="border-b border-border p-5 sm:p-6">
        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
          {t("personalTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("personalSubtitle")}</p>
      </div>

      {/* Read-only identity first, so the editable form below is unambiguous
          about what it actually controls. */}
      <dl className="divide-y divide-border">
        {locked.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <dt className="text-sm font-medium text-foreground">{row.label}</dt>
            <dd className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
              <span
                className={
                  row.value
                    ? `text-sm text-foreground${row.mono ? " font-mono" : ""}`
                    : "text-sm italic text-muted-foreground"
                }
              >
                {row.value ?? t("notProvided")}
              </span>
              <span className="text-xs text-muted-foreground">{t("lockedNote")}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-border p-5 sm:p-6">
        <PersonalInfoForm
          defaultValues={{
            name: user.name,
            preferredLocale: isLocale(user.preferredLocale ?? "")
              ? (user.preferredLocale as "rw" | "en" | "fr")
              : "rw",
          }}
        />
      </div>
    </section>
  );
}
