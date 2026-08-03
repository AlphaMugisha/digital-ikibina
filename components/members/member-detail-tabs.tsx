"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MemberDetailTabs({
  overview,
  contributions,
  loans,
  attendance,
  fines,
}: {
  overview: React.ReactNode;
  contributions: React.ReactNode;
  loans: React.ReactNode;
  attendance: React.ReactNode;
  fines: React.ReactNode;
}) {
  const t = useTranslations("members");

  return (
    <Tabs defaultValue="overview" className="mt-6">
      <div className="overflow-x-auto">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="flex-1 whitespace-nowrap sm:flex-none">
            {t("tabOverview")}
          </TabsTrigger>
          <TabsTrigger value="contributions" className="flex-1 whitespace-nowrap sm:flex-none">
            {t("tabContributions")}
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex-1 whitespace-nowrap sm:flex-none">
            {t("tabLoans")}
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex-1 whitespace-nowrap sm:flex-none">
            {t("tabAttendance")}
          </TabsTrigger>
          <TabsTrigger value="fines" className="flex-1 whitespace-nowrap sm:flex-none">
            {t("tabFines")}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-4">
        {overview}
      </TabsContent>
      <TabsContent value="contributions" className="mt-4">
        {contributions}
      </TabsContent>
      <TabsContent value="loans" className="mt-4">
        {loans}
      </TabsContent>
      <TabsContent value="attendance" className="mt-4">
        {attendance}
      </TabsContent>
      <TabsContent value="fines" className="mt-4">
        {fines}
      </TabsContent>
    </Tabs>
  );
}
