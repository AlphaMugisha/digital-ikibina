import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      {/* Form column */}
      <div className="relative flex flex-col px-6 py-10 md:justify-center md:px-12 md:py-0">
        {/* Mobile-only warm gradient behind the logo */}
        <div
          className="absolute inset-x-0 top-0 -z-10 h-52 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent md:hidden"
          aria-hidden="true"
        />
        <div className="flex justify-center pb-8 md:hidden">
          <Logo />
        </div>
        <div className="mx-auto hidden w-full max-w-[480px] pb-8 md:block">
          <Logo />
        </div>

        <div className="mx-auto w-full max-w-[480px]">{children}</div>
      </div>

      {/* Visual column — desktop only */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-accent md:block">
        <div className="grain-overlay" aria-hidden="true" />
        <div className="flex h-full flex-col items-center justify-center gap-6 px-12 text-center">
          <span className="flex size-24 items-center justify-center rounded-3xl bg-primary-foreground/10 font-display text-4xl font-semibold text-primary-foreground backdrop-blur-sm">
            DI
          </span>
          <p className="font-display max-w-sm text-2xl font-medium leading-snug tracking-tight text-primary-foreground">
            Ibimina byawe, kuri telefoni yawe.
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/75">
            Track contributions, loans, and share-outs — without the paper
            notebook.
          </p>
        </div>
      </div>
    </div>
  );
}
