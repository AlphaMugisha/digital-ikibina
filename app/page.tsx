import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  HandCoins,
  Landmark,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/landing/site-nav";
import { CommunitySavingsIllustration } from "@/components/illustrations/community-savings";

export default async function Home() {
  const t = await getTranslations("landing");
  const steps = [
    { icon: UsersRound, title: t("step1Title"), detail: t("step1Detail"), number: "01" },
    { icon: HandCoins, title: t("step2Title"), detail: t("step2Detail"), number: "02" },
    { icon: CircleDollarSign, title: t("step3Title"), detail: t("step3Detail"), number: "03" },
  ];
  const benefits = [
    { icon: Landmark, title: t("why1Title"), detail: t("why1Subtitle") },
    { icon: ShieldCheck, title: t("why2Title"), detail: t("why2Subtitle") },
    { icon: UsersRound, title: t("why3Title"), detail: t("why3Subtitle") },
    { icon: Sparkles, title: t("why4Title"), detail: t("why4Subtitle") },
  ];

  return (
    <div className="min-h-dvh overflow-hidden bg-background text-foreground">
      <SiteNav />

      <main>
        <section className="relative isolate">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_15%,oklch(0.92_0.08_145/50%),transparent_42%),linear-gradient(to_bottom,#fbfaf6,#f6f4ec)]" />
          <div className="mx-auto grid min-h-[650px] max-w-6xl items-center gap-12 px-6 pb-16 pt-14 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:pb-24 lg:pt-16">
            <div className="hero-fade relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3.5 py-2 text-xs font-semibold tracking-wide text-primary shadow-warm-sm backdrop-blur">
                <span className="size-1.5 rounded-full bg-primary" />
                {t("eyebrow")}
              </div>
              <h1 className="mt-7 max-w-2xl font-display text-[3.45rem] font-medium leading-[1.02] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[4.5rem]">
                {t("heroTitle")} <span className="italic text-primary">{t("heroTitleEmphasis")}</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                {t("heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 rounded-full px-6 text-sm shadow-warm-lg">
                  <Link href="/register">
                    {t("ctaPrimary")} <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full border-border/80 bg-white/60 px-6 text-sm">
                  <Link href="#how-it-works">
                    {t("ctaSecondary")} <ArrowDown className="ml-1 size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
                {[t("trustFree"), t("trustNoCard"), t("trustLanguages")].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary" aria-hidden="true" />{item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[510px] lg:ml-auto">
              <div className="absolute -left-8 top-16 size-28 rounded-full bg-accent/25 blur-2xl" />
              <div className="absolute -right-8 bottom-8 size-40 rounded-full bg-primary/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] bg-primary p-5 shadow-[0_32px_90px_-36px_oklch(0.3_0.1_155/65%)] sm:p-7">
                <div className="absolute -right-20 -top-28 size-72 rounded-full border border-white/10" />
                <div className="absolute -right-8 -top-16 size-48 rounded-full border border-white/10" />
                <div className="relative flex items-center justify-between text-primary-foreground">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">Digital Ibimina</p>
                    <p className="mt-1 text-lg font-semibold">{t("step1Title")}</p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10">
                    <ArrowUpRight className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="relative mt-4 rounded-2xl border border-white/15 bg-white/10 px-5 pb-2 pt-1 backdrop-blur-sm">
                  <CommunitySavingsIllustration className="mx-auto h-[210px] w-full max-w-[280px] drop-shadow-sm sm:h-[250px]" />
                </div>
                <div className="relative mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("step2Title")}</p>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="font-display text-2xl font-semibold text-foreground">RWF</span>
                      <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-primary"><Check className="size-3.5" />{t("why2Title")}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between rounded-2xl bg-accent p-4 text-accent-foreground">
                    <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{t("howItWorksLabel")}</p>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="font-display text-2xl font-semibold">{t("step3Title")}</span>
                      <ArrowUpRight className="mb-1 size-5" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-border/70 bg-white/95 p-3.5 shadow-warm-lg backdrop-blur sm:flex">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><UsersRound className="size-5" aria-hidden="true" /></span>
                <div><p className="text-xs font-semibold text-foreground">{t("why3Title")}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{t("why3Subtitle")}</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-y border-border/70 bg-white/70">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-24">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{t("howItWorksLabel")}</p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">{t("howItWorksTitle")}</h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map(({ icon: Icon, title, detail, number }) => (
                <article key={number} className="group relative rounded-3xl border border-border/80 bg-background p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-warm-lg sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="size-5" aria-hidden="true" /></span>
                    <span className="font-mono text-xs font-medium tracking-widest text-muted-foreground/60">{number}</span>
                  </div>
                  <h3 className="mt-7 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:px-8 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{t("whyUsLabel")}</p>
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">{t("whyUsTitle")}</h2>
              <p className="mt-4 max-w-lg leading-7 text-muted-foreground">{t("whyUsIntro")}</p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-2.5 text-sm font-semibold text-primary"><UsersRound className="size-4" aria-hidden="true" />{t("trustedBy")}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map(({ icon: Icon, title, detail }, index) => (
                <article key={title} className={`rounded-3xl border border-border/70 p-5 sm:p-6 ${index === 0 ? "bg-primary text-primary-foreground" : "bg-white"}`}>
                  <span className={`grid size-10 place-items-center rounded-xl ${index === 0 ? "bg-white/15" : "bg-secondary text-primary"}`}><Icon className="size-5" aria-hidden="true" /></span>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className={`mt-1.5 text-sm leading-6 ${index === 0 ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 md:px-8 md:pb-24">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#143e31] px-6 py-12 text-white sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-24 -top-44 size-[28rem] rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-8 -top-28 size-[20rem] rounded-full border border-white/10" />
            <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t("eyebrow")}</p>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">{t("closingTitle")}</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">{t("closingSubtitle")}</p>
              </div>
              <Button asChild className="h-12 shrink-0 rounded-full bg-accent px-6 text-accent-foreground hover:bg-accent/90">
                <Link href="/register">{t("ctaPrimary")} <ArrowRight className="ml-1 size-4" aria-hidden="true" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-8">
          <div><p className="font-display text-lg font-semibold">Digital Ibimina</p><p className="mt-1 text-xs text-muted-foreground">{t("footerTagline")}</p></div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground" aria-label="Footer">
            <Link href="#how-it-works" className="transition hover:text-primary">{t("footerHowItWorks")}</Link>
            <Link href="#about" className="transition hover:text-primary">{t("footerAbout")}</Link>
            <Link href="/login" className="transition hover:text-primary">{t("footerContact")}</Link>
            <Link href="/register" className="font-semibold text-primary">{t("ctaPrimary")}</Link>
          </nav>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Digital Ibimina · {t("footerMadeIn")}</p>
        </div>
      </footer>
    </div>
  );
}
