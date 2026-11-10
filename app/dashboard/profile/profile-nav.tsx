"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Section nav for the profile. Mirrors `components/groups/group-tabs.tsx`:
 * real links so each section is deep-linkable and server-rendered, with the
 * active segment derived from the path rather than held in client state.
 */
export function ProfileNav() {
  const pathname = usePathname();
  const t = useTranslations("profile");

  const base = "/dashboard/profile";
  const tabs = [
    { value: "overview", href: base, label: t("tabOverview") },
    { value: "ibimina", href: `${base}/ibimina`, label: t("tabIbimina") },
    { value: "activity", href: `${base}/activity`, label: t("tabActivity") },
    { value: "security", href: `${base}/security`, label: t("tabSecurity") },
  ] as const;

  const active =
    tabs.find((tab) => tab.value !== "overview" && pathname.startsWith(tab.href))?.value ??
    "overview";

  return (
    <Tabs value={active} className="mt-6">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList className="w-full sm:w-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              asChild
              className="flex-1 whitespace-nowrap sm:flex-none"
            >
              <Link href={tab.href}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
