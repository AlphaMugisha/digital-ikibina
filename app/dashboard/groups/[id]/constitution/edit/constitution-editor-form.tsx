"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConstitutionSections } from "@/lib/constitution-template";
import { SimpleMarkdown } from "@/components/constitution/simple-markdown";
import { saveConstitutionDraft, publishConstitution } from "../actions";

type StructuredRules = {
  latenessGraceDays: string;
  lateFeeType: string;
  lateFeeAmount: string;
  absenceFineAmount: string;
};

const SECTION_FIELDS: { key: keyof ConstitutionSections; labelKey: string }[] = [
  { key: "purpose", labelKey: "sectionPurpose" },
  { key: "contributionAgreement", labelKey: "sectionContributions" },
  { key: "meetingRules", labelKey: "sectionMeetings" },
  { key: "loanRules", labelKey: "sectionLoans" },
  { key: "shareOutMethod", labelKey: "sectionShareOut" },
  { key: "disputes", labelKey: "sectionDisputes" },
];

export function ConstitutionEditorForm({
  groupId,
  sections: initialSections,
  structuredRules: initialRules,
  isPublished,
}: {
  groupId: string;
  sections: ConstitutionSections;
  structuredRules: StructuredRules;
  isPublished: boolean;
}) {
  const [sections, setSections] = useState(initialSections);
  const [rules, setRules] = useState<StructuredRules>(initialRules);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("constitution");

  const previewContent = SECTION_FIELDS.map(
    (f) => `## ${t(f.labelKey as "sectionPurpose")}\n\n${sections[f.key]}`,
  ).join("\n\n");

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await saveConstitutionDraft(groupId, sections, rules);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("draftSaved"));
      router.refresh();
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const saveResult = await saveConstitutionDraft(groupId, sections, rules);
      if (!saveResult.ok) {
        toast.error(saveResult.error);
        return;
      }
      const result = await publishConstitution(groupId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("published"));
      router.push(`/dashboard/groups/${groupId}/constitution`);
    });
  }

  return (
    <Tabs defaultValue="edit">
      <TabsList>
        <TabsTrigger value="edit">{t("editTab")}</TabsTrigger>
        <TabsTrigger value="preview">{t("previewTab")}</TabsTrigger>
      </TabsList>

      <TabsContent value="edit" className="mt-4 space-y-6 pb-24">
        {SECTION_FIELDS.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={f.key}>{t(f.labelKey as "sectionPurpose")}</Label>
            <Textarea
              id={f.key}
              value={sections[f.key]}
              onChange={(e) => setSections((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="min-h-28 rounded-xl text-base"
            />
          </div>
        ))}

        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("sectionFines")}
          </h2>

          <div className="space-y-2">
            <Label htmlFor="grace-days">{t("graceDaysLabel")}</Label>
            <Input
              id="grace-days"
              value={rules.latenessGraceDays}
              onChange={(e) => setRules((prev) => ({ ...prev, latenessGraceDays: e.target.value }))}
              type="text"
              inputMode="numeric"
              className="h-11 rounded-xl text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("lateFeeTypeLabel")}</Label>
            <div className="flex gap-2">
              {(["NONE", "FIXED", "PERCENT"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRules((prev) => ({ ...prev, lateFeeType: type }))}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-medium ${
                    rules.lateFeeType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {t(`lateFeeType${type.charAt(0)}${type.slice(1).toLowerCase()}` as "lateFeeTypeNone")}
                </button>
              ))}
            </div>
          </div>

          {rules.lateFeeType !== "NONE" && (
            <div className="space-y-2">
              <Label htmlFor="late-fee-amount">
                {rules.lateFeeType === "FIXED" ? t("lateFeeAmountFixedLabel") : t("lateFeeAmountPercentLabel")}
              </Label>
              <Input
                id="late-fee-amount"
                value={rules.lateFeeAmount}
                onChange={(e) => setRules((prev) => ({ ...prev, lateFeeAmount: e.target.value }))}
                type="text"
                inputMode="decimal"
                className="h-11 rounded-xl text-base"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="absence-fine">{t("absenceFineAmountLabel")}</Label>
            <Input
              id="absence-fine"
              value={rules.absenceFineAmount}
              onChange={(e) => setRules((prev) => ({ ...prev, absenceFineAmount: e.target.value }))}
              type="text"
              inputMode="decimal"
              className="h-11 rounded-xl text-base"
            />
          </div>
        </div>

        <div className="fixed inset-x-4 bottom-24 z-30 flex gap-2 md:static md:inset-auto">
          <Button
            type="button"
            variant="outline"
            className="h-14 flex-1 rounded-full text-base shadow-warm-lg md:h-11 md:shadow-none"
            disabled={isPending}
            onClick={handleSaveDraft}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("saveDraft")}
          </Button>
          <Button
            type="button"
            className="h-14 flex-1 rounded-full text-base shadow-warm-lg md:h-11 md:shadow-none"
            disabled={isPending}
            onClick={handlePublish}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {isPublished ? t("publishUpdate") : t("publish")}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="mt-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <SimpleMarkdown content={previewContent} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
