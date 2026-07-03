import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GroupForm } from "./group-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("groups");
  return { title: `${t("createTitle")} — Digital Ibimina` };
}

export default async function NewGroupPage() {
  const t = await getTranslations("groups");

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {t("createTitle")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("createSubtitle")}
      </p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-warm-sm">
        <GroupForm />
      </div>
    </div>
  );
}
