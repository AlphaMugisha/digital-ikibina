"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUser, Home, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", rw: "Ahabanza", en: "Home", icon: Home, exact: true },
  { href: "/dashboard/groups", rw: "Amatsinda", en: "Groups", icon: Users, exact: false },
  { href: "/dashboard/profile", rw: "Umwirondoro", en: "Profile", icon: CircleUser, exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/** Thumb-friendly bottom tab bar — mobile only. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-3">
        {LINKS.map(({ href, rw, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs",
                  active
                    ? "font-semibold text-emerald-700"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {rw}
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

  return (
    <ul className="space-y-1">
      {LINKS.map(({ href, rw, en, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm",
                active
                  ? "bg-emerald-50 font-semibold text-emerald-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {rw} / {en}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
