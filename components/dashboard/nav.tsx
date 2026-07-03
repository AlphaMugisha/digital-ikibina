"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { CircleUser, Home, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function useLinks() {
  const t = useTranslations("common");
  return [
    { href: "/dashboard", label: t("home"), icon: Home, exact: true },
    { href: "/dashboard/groups", label: t("groups"), icon: Users, exact: false },
    { href: "/dashboard/profile", label: t("profile"), icon: CircleUser, exact: false },
  ] as const;
}

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/** Floating pill tab bar — mobile only. */
export function BottomNav() {
  const pathname = usePathname();
  const links = useLinks();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-4 bottom-4 z-40 rounded-full border border-border bg-background/95 shadow-warm-lg backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-3">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
                {active && (
                  <span
                    className="absolute top-2 size-1 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sidebar links — desktop only (the aside wrapper lives in the layout). */
export function SidebarNav() {
  const pathname = usePathname();
  const links = useLinks();

  return (
    <ul className="space-y-1">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-full px-4 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
