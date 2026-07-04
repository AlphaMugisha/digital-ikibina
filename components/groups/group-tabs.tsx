"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function GroupTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  const t = useTranslations("groups");

  const base = `/dashboard/groups/${groupId}`;
  const tabs = [
    { value: "overview", href: base, label: t("tabOverview") },
    { value: "meetings", href: `${base}/meetings`, label: t("tabMeetings") },
    { value: "members", href: `${base}/members`, label: t("tabMembers") },
  ] as const;

  const active =
    tabs.find((tab) => tab.value !== "overview" && pathname.startsWith(tab.href))?.value ??
    "overview";

  return (
    <Tabs value={active} className="mt-4">
      <TabsList className="w-full sm:w-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild className="flex-1 sm:flex-none">
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
