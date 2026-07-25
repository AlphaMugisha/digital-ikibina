"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addMeetingDecision } from "./actions";

export type DecisionRow = {
  id: string;
  text: string;
  createdAt: string;
};

export function MeetingDecisions({
  meetingId,
  decisions: initialDecisions,
  canManage,
  locale,
}: {
  meetingId: string;
  decisions: DecisionRow[];
  canManage: boolean;
  locale: string;
}) {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("meetings");

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  function handleAdd() {
    startTransition(async () => {
      const result = await addMeetingDecision(meetingId, text);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDecisions((prev) => [...prev, result.data]);
      setText("");
      toast.success(t("decisionAdded"));
      router.refresh();
    });
  }

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("decisionsTitle")}
      </h2>

      {decisions.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("noDecisionsYet")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {decisions.map((decision) => (
            <li
              key={decision.id}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <p className="text-sm text-foreground">{decision.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {dateFormatter.format(new Date(decision.createdAt))}
              </p>
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <div className="mt-4 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("decisionPlaceholder")}
            className="min-h-20 rounded-xl text-base"
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full"
            disabled={isPending || text.trim().length < 3}
            onClick={handleAdd}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            {t("addDecision")}
          </Button>
        </div>
      )}
    </div>
  );
}
