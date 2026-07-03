import Link from "next/link";
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

const STEPS = [
  {
    icon: Users,
    step: "01",
    rw: "Kora itsinda ryawe",
    en: "Create your group",
    detail:
      "Andika izina ry'itsinda, umusanzu wa buri cyumweru, n'umunsi w'inama.",
  },
  {
    icon: NotebookPen,
    step: "02",
    rw: "Andika amafaranga",
    en: "Record contributions",
    detail:
      "Buri nama, umunyamabanga yandika imisanzu n'inguzanyo mu kanya gato.",
  },
  {
    icon: HandCoins,
    step: "03",
    rw: "Sangira umusaruro",
    en: "Share out automatically",
    detail:
      "Impera y'umuzenguruko, buri wese abona umugabane we wabazwe neza.",
  },
] as const;

const WHY_US = [
  {
    rw: "Ikora kuri telefoni iyo ari yo yose",
    en: "Works on any phone",
  },
  {
    rw: "Ubutumwa bwa SMS bwemeza buri musanzu",
    en: "SMS confirmations",
  },
  {
    rw: "Buri munyamuryango abona konti ye",
    en: "Transparent for every member",
  },
  {
    rw: "Nta kaye izongera gutakara",
    en: "No more lost notebooks",
  },
] as const;

export default function Home() {
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
              Ibimina · VSLA
            </p>
            <h1 className="hero-fade font-display mt-5 text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-7xl">
              Ibimina byawe,{" "}
              <em className="font-display italic text-accent">
                reimagined.
              </em>
            </h1>
            <p className="hero-fade mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground [animation-delay:100ms]">
              Track contributions, loans, and share-outs — without the paper
              notebook. Built for how Rwandan savings groups actually work.
            </p>

            <div className="hero-fade mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:150ms] sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 w-full rounded-full text-base sm:w-auto"
              >
                <Link href="/register">
                  Tangira ubuntu / Get started free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-14 w-full rounded-full text-base sm:w-auto"
              >
                <Link href="#uburyo">Reba uko bikora / See how it works</Link>
              </Button>
            </div>

            <div className="hero-fade mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground [animation-delay:200ms]">
              {["Free to start", "No card required", "Kinyarwanda + English"].map(
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
            Uburyo / How it works
          </p>
          <h2 className="scroll-fade font-display mt-3 text-center text-3xl font-medium tracking-tight text-foreground md:text-5xl">
            Uko bikora
          </h2>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            <div
              className="pointer-events-none absolute inset-x-16 top-11 hidden border-t border-dashed border-border md:block"
              aria-hidden="true"
            />
            {STEPS.map(({ icon: Icon, step, rw, en, detail }) => (
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
                  {rw}
                </h3>
                <p className="text-sm font-medium text-primary">{en}</p>
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
                Impamvu / Why us
              </p>
              <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                Yubatswe ku buryo ibimina bikora
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                Digital Ibimina replaces the paper notebook with something
                every member can trust — on the phone they already carry.
              </p>
              <p className="mt-6 text-sm font-medium text-primary">
                1,200+ members already saving
              </p>
            </div>

            <ul className="scroll-fade grid gap-4 sm:grid-cols-2">
              {WHY_US.map(({ rw, en }) => (
                <li key={en} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed">
                    <span className="block font-semibold text-foreground">
                      {rw}
                    </span>
                    <span className="text-muted-foreground">{en}</span>
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
            &ldquo;Twahoze dukoresha ikaye, none ubu buri munyamuryango
            abona konti ye ku telefoni ye ubwo ari bwo ariyo yose.&rdquo;
          </p>
          <p className="scroll-fade mt-5 text-sm text-muted-foreground">
            Jean-Claude M. &middot; Bugesera VSLA Leader
          </p>
        </section>

        {/* Closing CTA */}
        <section className="bg-primary">
          <div className="mx-auto flex flex-col items-center gap-6 px-6 py-20 text-center md:px-8 md:py-24">
            <h2 className="scroll-fade font-display max-w-xl text-3xl font-medium tracking-tight text-primary-foreground md:text-4xl">
              Itsinda ryawe rirakwitegereje
            </h2>
            <p className="scroll-fade text-primary-foreground/80">
              Your group is waiting for you. Start in less than two minutes.
            </p>
            <Button
              asChild
              size="lg"
              className="scroll-fade h-14 w-full rounded-full bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90 sm:w-auto"
            >
              <Link href="/register">Tangira ubuntu / Get started</Link>
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
                Gukusanya, kubitsa, no kugurizanya byoroshye.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="#uburyo" className="text-muted-foreground hover:text-foreground">
                    Uko bikora / How it works
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-muted-foreground hover:text-foreground">
                    Tangira / Get started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Company
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Ibyerekeye / About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Twandikire / Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Legal
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Amabwiriza / Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Ibanga / Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Digital Ibimina</p>
            <p>🇷🇼 Made in Kigali</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
