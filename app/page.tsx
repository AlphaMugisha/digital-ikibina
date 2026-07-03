import Link from "next/link";
import {
  BookX,
  Check,
  Eye,
  HandCoins,
  MessageSquareText,
  NotebookPen,
  Smartphone,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Users,
    step: "1",
    rw: "Kora itsinda ryawe",
    en: "Create your group",
    detail:
      "Andika izina ry'itsinda, umusanzu wa buri cyumweru, n'umunsi w'inama.",
  },
  {
    icon: NotebookPen,
    step: "2",
    rw: "Andika amafaranga",
    en: "Record contributions",
    detail:
      "Buri nama, umunyamabanga yandika imisanzu n'inguzanyo mu kanya gato.",
  },
  {
    icon: HandCoins,
    step: "3",
    rw: "Sangira umusaruro",
    en: "Share out automatically",
    detail:
      "Impera y'umuzenguruko, buri wese abona umugabane we wabazwe neza.",
  },
] as const;

const WHY_US = [
  {
    icon: Smartphone,
    text: "Ikora kuri telefoni iyo ari yo yose / Works on any phone",
  },
  {
    icon: MessageSquareText,
    text: "Ubutumwa bwa SMS bwemeza buri musanzu / SMS confirmations",
  },
  {
    icon: Eye,
    text: "Buri munyamuryango abona konti ye / Transparent for every member",
  },
  {
    icon: BookX,
    text: "Nta kaye izongera gutakara / No more lost notebooks",
  },
] as const;

const LEDGER_ROWS = [
  { name: "MUKAMANA J.", amount: "2,000 RWF" },
  { name: "NIYONZIMA E.", amount: "2,000 RWF" },
  { name: "UWASE C.", amount: "2,000 RWF" },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-slate-900">
      {/* Header */}
      <header className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="font-display text-lg font-bold text-emerald-950"
        >
          Digital Ibimina
        </Link>
        <Button asChild variant="ghost" className="h-11">
          <Link href="/login">Injira / Sign in</Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto grid items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:pb-24 md:pt-20">
          <div className="hero-fade">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
              Ibimina · VSLA
            </p>
            <h1 className="font-display mt-3 text-4xl font-bold leading-tight text-emerald-950 sm:text-5xl md:text-6xl">
              Ibimina byawe, kuri telefoni yawe
            </h1>
            <p className="mt-4 max-w-md text-lg text-slate-600">
              Track contributions, loans, and share-outs without the paper
              notebook.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 w-full text-base sm:w-auto">
                <Link href="/register">Tangira ubuntu / Get started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full text-base sm:w-auto"
              >
                <Link href="/login">Injira / Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Signature: the digital ledger card — what replaces the notebook */}
          <div className="hero-fade mx-auto w-full max-w-sm [animation-delay:150ms]">
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-lg shadow-emerald-950/5">
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                <div>
                  <p className="font-display text-sm font-bold text-emerald-950">
                    Itsinda &laquo;Abisunganye&raquo;
                  </p>
                  <p className="text-xs text-slate-500">
                    Inama yo kuwa gatanu / Friday meeting
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  Icyumweru 14
                </span>
              </div>
              <ul className="divide-y divide-dashed divide-slate-200">
                {LEDGER_ROWS.map((row) => (
                  <li
                    key={row.name}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-sm text-slate-700">{row.name}</span>
                    <span className="flex items-center gap-2 font-mono text-sm text-slate-900">
                      {row.amount}
                      <Check
                        className="size-4 text-emerald-600"
                        aria-hidden="true"
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-sm font-semibold text-emerald-950">
                  Igiteranyo / Total
                </span>
                <span className="font-mono text-sm font-bold text-emerald-700">
                  6,000 RWF
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <p className="container mx-auto border-y border-slate-200 px-4 py-4 text-center text-sm text-slate-500">
          Yubakiwe ibimina byo mu Rwanda / Built for Rwandan savings groups
          (VSLA / Ibimina)
        </p>

        {/* How it works */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <h2 className="font-display scroll-fade text-center text-3xl font-bold text-emerald-950 sm:text-4xl">
            Uko bikora / How it works
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
            {STEPS.map(({ icon: Icon, step, rw, en, detail }) => (
              <div
                key={step}
                className="scroll-fade rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm text-slate-400">
                    {step}/3
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-emerald-950">
                  {rw}
                </h3>
                <p className="text-sm font-medium text-emerald-700">{en}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why us */}
        <section className="border-y border-slate-200 bg-white">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <h2 className="font-display scroll-fade text-center text-3xl font-bold text-emerald-950 sm:text-4xl">
              Impamvu Digital Ibimina / Why us
            </h2>
            <ul className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
              {WHY_US.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="scroll-fade flex items-start gap-3 rounded-xl p-2"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-emerald-950">
          <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center md:py-20">
            <h2 className="font-display scroll-fade max-w-xl text-3xl font-bold text-white sm:text-4xl">
              Itsinda ryawe rirakwitegereje
            </h2>
            <p className="scroll-fade text-emerald-200">
              Your group is waiting for you. Start in less than two minutes.
            </p>
            <Button
              asChild
              size="lg"
              className="scroll-fade h-12 w-full bg-amber-400 text-base font-semibold text-emerald-950 hover:bg-amber-300 sm:w-auto"
            >
              <Link href="/register">Tangira ubuntu / Get started</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-500 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Digital Ibimina</p>
        <nav className="flex gap-6">
          <Link href="#" className="hover:text-emerald-700">
            Ibyerekeye / About
          </Link>
          <Link href="#" className="hover:text-emerald-700">
            Twandikire / Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}
