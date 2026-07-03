"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations("common");
  const tLanding = useTranslations("landing");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-8">
        <Logo />

        <nav className="hidden items-center gap-2 sm:flex">
          <LanguageSwitcher />
          <Button asChild variant="ghost" className="h-11 rounded-full">
            <Link href="/login">{t("signIn")}</Link>
          </Button>
          <Button asChild className="h-11 rounded-full">
            <Link href="/register">{t("getStarted")}</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <LanguageSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={tLanding("openMenu")}
                className="size-11"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xs">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="h-12 rounded-full text-base">
                    <Link href="/login">{t("signIn")}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="h-12 rounded-full text-base">
                    <Link href="/register">{t("getStarted")}</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
