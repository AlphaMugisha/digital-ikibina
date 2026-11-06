import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/landing/site-nav";
import { LandingGlyph, type LandingGlyphName } from "@/components/landing/landing-glyph";

export default async function Home() {
  const t = await getTranslations("landing");
  const steps = [
    { icon: "UsersRound", title: t("step1Title"), detail: t("step1Detail") },
    { icon: "HandCoins", title: t("step2Title"), detail: t("step2Detail") },
    { icon: "CircleDollarSign", title: t("step3Title"), detail: t("step3Detail") },
  ];
  const benefits = [
    { icon: "Landmark", title: t("why1Title"), detail: t("why1Subtitle") },
    { icon: "ShieldCheck", title: t("why2Title"), detail: t("why2Subtitle") },
    { icon: "UsersRound", title: t("why3Title"), detail: t("why3Subtitle") },
    { icon: "Banknote", title: t("why4Title"), detail: t("why4Subtitle") },
  ];

  return (
    <div className="min-h-dvh overflow-hidden bg-[#f6f4ed] text-[#163c31]">
      <SiteNav />
      <main>
        <section className="relative isolate overflow-hidden bg-[#163c31] text-[#fbfaef]">
          <div className="pointer-events-none absolute -right-56 -top-72 -z-0 size-[46rem] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-28 -top-44 -z-0 size-[32rem] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-[-22rem] left-[-16rem] -z-0 size-[38rem] rounded-full bg-[#d9f36a]/10 blur-3xl" />

          <div className="relative mx-auto grid min-h-[720px] max-w-[1440px] items-center gap-14 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-20">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#d9f36a]">
                <span className="size-2 rounded-full bg-[#d9f36a]" />
                {t("eyebrow")}
              </div>
              <h1 className="mt-8 font-display text-[4.2rem] font-medium leading-[0.92] tracking-[-0.065em] sm:text-7xl lg:text-[6.8rem]">
                {t("heroTitle")} <span className="text-[#d9f36a]">{t("heroTitleEmphasis")}</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                {t("heroSubtitle")}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-14 rounded-full bg-[#d9f36a] px-7 text-base font-bold text-[#163c31] shadow-[0_10px_35px_-12px_rgba(217,243,106,.65)] hover:bg-[#e5ff83]">
                  <Link href="/register">{t("ctaPrimary")}<LandingGlyph name="ArrowRight" className="ml-2 size-5" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-14 rounded-full border-white/25 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white">
                  <Link href="#how-it-works">{t("ctaSecondary")}<LandingGlyph name="ArrowDown" className="ml-2 size-4" /></Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/65">
                {[t("trustFree"), t("trustNoCard"), t("trustLanguages")].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2"><LandingGlyph name="Check" className="size-4 text-[#d9f36a]" />{item}</span>
                ))}
              </div>
              <div className="mt-14 hidden items-center gap-3 border-t border-white/15 pt-5 text-sm text-white/70 sm:flex">
                <div className="flex -space-x-2" aria-hidden="true">
                  {["bg-[#e9a37b]", "bg-[#f0d17a]", "bg-[#a7c8a1]", "bg-[#d4a4c7]"].map((color, i) => (
                    <span key={i} className={`grid size-8 place-items-center rounded-full border-2 border-[#163c31] ${color}`}>
                      <LandingGlyph name="UsersRound" className="size-3.5 text-[#163c31]" />
                    </span>
                  ))}
                </div>
                <span>{t("trustedBy")}</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
              <div className="absolute -right-8 top-8 size-32 rounded-full bg-[#d9f36a]/20 blur-3xl" />
              <div className="relative rotate-1 rounded-[2rem] bg-[#d9f36a] p-3 shadow-[0_36px_100px_-36px_rgba(0,0,0,.65)] sm:rotate-2 sm:p-4">
                <div className="overflow-hidden rounded-[1.4rem] bg-[#fbfaef] text-[#163c31]">
                  <div className="flex items-center justify-between border-b border-[#163c31]/10 px-5 py-4 sm:px-7">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-[#163c31] text-[#d9f36a]"><LandingGlyph name="UsersRound" className="size-5" /></span>
                      <div><p className="text-sm font-bold">Digital Ibimina</p><p className="text-[11px] text-[#163c31]/55">{t("step1Title")}</p></div>
                    </div>
                    <span className="rounded-full bg-[#e8edda] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#42664e]">Preview</span>
                  </div>
                  <div className="px-5 pb-6 pt-6 sm:px-7">
                    <div className="flex items-end justify-between gap-4">
                      <div><p className="text-xs font-semibold text-[#163c31]/55">{t("step2Title")}</p><p className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t("why3Title")}</p></div>
                      <span className="mb-1 grid size-11 shrink-0 place-items-center rounded-full bg-[#d9f36a]"><LandingGlyph name="ArrowUpRight" className="size-5" /></span>
                    </div>
                    <div className="mt-6 rounded-2xl bg-[#e9eddf] p-4 sm:p-5">
                      <div className="flex items-center justify-between text-xs font-semibold"><span>{t("howItWorksTitle")}</span><span className="text-[#163c31]/50">{t("step3Title")}</span></div>
                      <div className="mt-5 flex h-28 items-end gap-2 sm:h-36 sm:gap-3" aria-hidden="true">
                        {[38, 55, 46, 72, 61, 86, 68, 100, 78, 91, 72, 96].map((height, i) => <span key={i} style={{ height: `${height}%` }} className={`flex-1 rounded-t-md ${i === 7 ? "bg-[#163c31]" : "bg-[#b7c9a7]"}`} />)}
                      </div>
                      <div className="mt-3 flex justify-between text-[9px] font-semibold uppercase tracking-wider text-[#163c31]/40"><span>{t("step1Title")}</span><span>{t("step2Title")}</span><span>{t("step3Title")}</span></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white p-4"><div className="flex items-center gap-2 text-[#163c31]/55"><LandingGlyph name="CalendarCheck2" className="size-4" /><span className="text-[10px] font-bold uppercase tracking-wider">{t("step2Title")}</span></div><p className="mt-3 text-sm font-bold">{t("why2Title")}</p></div>
                      <div className="rounded-2xl bg-[#163c31] p-4 text-white"><div className="flex items-center gap-2 text-[#d9f36a]"><LandingGlyph name="BadgeCheck" className="size-4" /><span className="text-[10px] font-bold uppercase tracking-wider">{t("step3Title")}</span></div><p className="mt-3 text-sm font-bold">{t("why4Title")}</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-7 hidden max-w-[220px] -rotate-3 rounded-2xl bg-white p-4 text-[#163c31] shadow-xl sm:block">
                <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-[#e8edda] text-[#42664e]"><LandingGlyph name="Check" className="size-4" /></span><span className="text-xs font-bold">{t("why2Title")}</span></div>
                <p className="mt-2 text-[11px] leading-5 text-[#163c31]/55">{t("why2Subtitle")}</p>
              </div>
            </div>
          </div>
          <div className="relative flex overflow-hidden border-t border-white/15 bg-[#d9f36a] py-4 text-[#163c31]">
            <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 text-[10px] font-extrabold uppercase tracking-[0.2em] sm:text-xs">
              {[t("step1Title"), t("step2Title"), t("step3Title"), t("why3Title")].map((label, i) => <span key={label} className="inline-flex items-center gap-8">{label}{i < 3 && <span className="size-1.5 rounded-full bg-[#163c31]/40" />}</span>)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 bg-[#f6f4ed]">
          <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 md:py-28 lg:px-16">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#5d785a]">{t("howItWorksLabel")}</p><h2 className="mt-4 font-display text-4xl font-medium leading-[1.02] tracking-[-0.05em] sm:text-6xl">{t("howItWorksTitle")}</h2></div>
              <p className="max-w-sm text-sm leading-6 text-[#163c31]/60">{t("whyUsIntro")}</p>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {steps.map(({ icon, title, detail }, index) => (
                <article key={title} className={`relative min-h-[260px] overflow-hidden rounded-[1.8rem] p-7 sm:p-9 ${index === 1 ? "bg-[#e9a37b] text-[#3e281e]" : index === 2 ? "bg-[#d9f36a] text-[#163c31]" : "bg-white text-[#163c31]"}`}>
                  <span className="absolute -right-5 -top-12 font-display text-[12rem] font-semibold leading-none opacity-[0.06]">0{index + 1}</span>
                  <div className="relative flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-black/5"><LandingGlyph name={icon as LandingGlyphName} className="size-5" /></span><span className="font-mono text-xs font-bold opacity-50">STEP 0{index + 1}</span></div>
                  <h3 className="relative mt-12 text-2xl font-bold tracking-tight">{title}</h3>
                  <p className="relative mt-3 max-w-sm text-sm leading-6 opacity-70">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 bg-[#e8edda]">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 sm:px-10 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-16">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#5d785a]">{t("whyUsLabel")}</p><h2 className="mt-4 max-w-lg font-display text-4xl font-medium leading-[1.03] tracking-[-0.05em] sm:text-6xl">{t("whyUsTitle")}</h2><p className="mt-5 max-w-lg text-base leading-7 text-[#163c31]/65">{t("whyUsIntro")}</p><div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#163c31] px-4 py-2.5 text-sm font-semibold text-[#d9f36a]"><LandingGlyph name="UsersRound" className="size-4" />{t("trustedBy")}</div></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map(({ icon, title, detail }, index) => <article key={title} className={`min-h-44 rounded-[1.6rem] p-6 sm:p-7 ${index === 0 ? "bg-[#163c31] text-white" : "bg-[#fbfaef] text-[#163c31]"}`}><span className={`grid size-10 place-items-center rounded-xl ${index === 0 ? "bg-white/10 text-[#d9f36a]" : "bg-[#e8edda] text-[#42664e]"}`}><LandingGlyph name={icon as LandingGlyphName} className="size-5" /></span><h3 className="mt-6 font-bold">{title}</h3><p className={`mt-2 text-sm leading-6 ${index === 0 ? "text-white/65" : "text-[#163c31]/60"}`}>{detail}</p></article>)}
            </div>
          </div>
        </section>

        <section className="bg-[#d9f36a] px-6 py-16 text-[#163c31] sm:px-10 md:py-24 lg:px-16">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-3xl"><p className="text-xs font-extrabold uppercase tracking-[0.22em]">{t("eyebrow")}</p><h2 className="mt-4 font-display text-5xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-7xl">{t("closingTitle")}</h2><p className="mt-5 text-base text-[#163c31]/70">{t("closingSubtitle")}</p></div>
            <Button asChild className="h-14 shrink-0 rounded-full bg-[#163c31] px-7 text-base text-white hover:bg-[#245541]"><Link href="/register">{t("ctaPrimary")}<LandingGlyph name="ArrowRight" className="ml-2 size-5" /></Link></Button>
          </div>
        </section>
      </main>

      <footer className="bg-[#163c31] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-16">
          <div><p className="font-display text-xl font-semibold">Digital Ibimina</p><p className="mt-1 text-xs text-white/55">{t("footerTagline")}</p></div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/70" aria-label="Footer"><Link href="#how-it-works" className="hover:text-[#d9f36a]">{t("footerHowItWorks")}</Link><Link href="#about" className="hover:text-[#d9f36a]">{t("footerAbout")}</Link><Link href="/login" className="hover:text-[#d9f36a]">{t("footerContact")}</Link><Link href="/register" className="font-bold text-[#d9f36a]">{t("ctaPrimary")}</Link></nav>
          <p className="text-xs text-white/45">© {new Date().getFullYear()} Digital Ibimina · {t("footerMadeIn")}</p>
        </div>
      </footer>
    </div>
  );
}
