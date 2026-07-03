import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Check,
  HandCoins,
  NotebookPen,
  Quote,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/landing/site-nav";

const STEP_ICONS = [Users, NotebookPen, HandCoins] as const;

export default async function Home() {
  const t = await getTranslations("landing");

  const steps = [1, 2, 3].map((n) => ({
    icon: STEP_ICONS[n - 1],
    step: String(n).padStart(2, "0"),
    title: t(`step${n}Title` as "step1Title"),
    detail: t(`step${n}Detail` as "step1Detail"),
  }));

  const whyUs = [1, 2, 3, 4].map((n) => ({
    title: t(`why${n}Title` as "why1Title"),
    subtitle: t(`why${n}Subtitle` as "why1Subtitle"),
  }));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div
            className="hero-blob hero-blob--emerald -left-24 -top-32 size-96"
            aria-hidden="true"
          />
          <div
            className="hero-blob hero-blob--amber -bottom-32 -right-16 size-96"
            aria-hidden="true"
          />
          <div className="grain-overlay" aria-hidden="true" />

          <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-16 text-center md:px-8 md:pb-32 md:pt-24">
            <p className="hero-fade text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h1 className="hero-fade font-display mt-5 text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-7xl">
              {t("heroTitle")}{" "}
              <em className="font-display italic text-accent">
                {t("heroTitleEmphasis")}
              </em>
            </h1>
            <p className="hero-fade mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground [animation-delay:100ms]">
              {t("heroSubtitle")}
            </p>

            <div className="hero-fade mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:150ms] sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 w-full rounded-full text-base sm:w-auto"
              >
                <Link href="/register">
                  {t("ctaPrimary")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-14 w-full rounded-full text-base sm:w-auto"
              >
                <Link href="#uburyo">{t("ctaSecondary")}</Link>
              </Button>
            </div>

            <div className="hero-fade mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground [animation-delay:200ms]">
              {[t("trustFree"), t("trustNoCard"), t("trustLanguages")].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-background/80 px-3 py-1.5"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="uburyo" className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-32">
          <p className="scroll-fade text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("howItWorksLabel")}
          </p>
          <h2 className="scroll-fade font-display mt-3 text-center text-3xl font-medium tracking-tight text-foreground md:text-5xl">
            {t("howItWorksTitle")}
          </h2>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            <div
              className="pointer-events-none absolute inset-x-16 top-11 hidden border-t border-dashed border-border md:block"
              aria-hidden="true"
            />
            {steps.map(({ icon: Icon, step, title, detail }) => (
              <div
                key={step}
                className="scroll-fade relative rounded-2xl border border-border bg-card p-7 shadow-warm-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-3xl font-medium text-accent">
                    {step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why us */}
        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-32">
            <div className="scroll-fade">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("whyUsLabel")}
              </p>
              <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                {t("whyUsTitle")}
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                {t("whyUsIntro")}
              </p>
              <p className="mt-6 text-sm font-medium text-primary">
                {t("trustedBy")}
              </p>
            </div>

            <ul className="scroll-fade grid gap-4 sm:grid-cols-2">
              {whyUs.map(({ title, subtitle }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed">
                    <span className="block font-semibold text-foreground">
                      {title}
                    </span>
                    <span className="text-muted-foreground">{subtitle}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Testimonial */}
        <section className="mx-auto max-w-3xl px-6 py-20 text-center md:px-8 md:py-32">
          <Quote
            className="scroll-fade mx-auto size-10 text-accent"
            aria-hidden="true"
          />
          <p className="scroll-fade font-display mt-6 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            &ldquo;{t("testimonialQuote")}&rdquo;
          </p>
          <p className="scroll-fade mt-5 text-sm text-muted-foreground">
            {t("testimonialAuthor")}
          </p>
        </section>

        {/* Closing CTA */}
        <section className="bg-primary">
          <div className="mx-auto flex flex-col items-center gap-6 px-6 py-20 text-center md:px-8 md:py-24">
            <h2 className="scroll-fade font-display max-w-xl text-3xl font-medium tracking-tight text-primary-foreground md:text-4xl">
              {t("closingTitle")}
            </h2>
            <p className="scroll-fade text-primary-foreground/80">
              {t("closingSubtitle")}
            </p>
            <Button
              asChild
              size="lg"
              className="scroll-fade h-14 w-full rounded-full bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90 sm:w-auto"
            >
              <Link href="/register">{t("ctaPrimary")}</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-8">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Logo />
              <p className="mt-3 max-w-[22ch] text-sm leading-relaxed text-muted-foreground">
                {t("footerTagline")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("footerProduct")}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="#uburyo" className="text-muted-foreground hover:text-foreground">
                    {t("footerHowItWorks")}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-muted-foreground hover:text-foreground">
                    {t("ctaPrimary")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("footerCompany")}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    {t("footerAbout")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    {t("footerContact")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("footerLegal")}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    {t("footerTerms")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    {t("footerPrivacy")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Digital Ibimina</p>
            <p>🇷🇼 {t("footerMadeIn")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
