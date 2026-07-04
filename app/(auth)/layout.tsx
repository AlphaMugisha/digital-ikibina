import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = await getTranslations("auth");

  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      {/* Form column */}
      <div className="relative flex flex-col px-6 py-10 md:justify-center md:px-12 md:py-0">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>

        <div className="flex justify-center pb-8 md:hidden">
          <Logo />
        </div>
        <div className="mx-auto hidden w-full max-w-[480px] pb-8 md:block">
          <Logo />
        </div>

        <div className="mx-auto w-full max-w-[480px]">{children}</div>
      </div>

      {/* Visual column — desktop only */}
      <div className="relative hidden bg-primary md:block">
        <div className="flex h-full flex-col items-center justify-center gap-6 px-12 text-center">
          <span className="flex size-24 items-center justify-center rounded-3xl border border-primary-foreground/20 font-display text-4xl font-semibold text-primary-foreground">
            DI
          </span>
          <p className="font-display max-w-sm text-2xl font-medium leading-snug tracking-tight text-primary-foreground">
            {t("visualHeadline")}
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/75">
            {t("visualSubtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
