"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, localeFlags, localeNames, type Locale } from "@/i18n/config";
import { setLocale } from "@/app/actions/locale";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function onSelect(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={isPending}
          aria-label={t("language")}
          className={cn("h-11 gap-1.5 rounded-full px-3", className)}
        >
          <span className="text-base leading-none">{localeFlags[locale]}</span>
          <span className="hidden text-xs font-semibold uppercase sm:inline">
            {locale}
          </span>
          <Globe className="size-4 text-muted-foreground sm:hidden" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => onSelect(code)}
            className="gap-2"
          >
            <span className="text-base leading-none">{localeFlags[code]}</span>
            <span className="flex-1">{localeNames[code]}</span>
            {code === locale && (
              <Check className="size-4 text-primary" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
