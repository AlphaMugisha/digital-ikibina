"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatRWF } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  ContributionDialog,
  type ContributionTarget,
} from "./contribution-dialog";
import { EndMeetingButton } from "./end-meeting-button";

export type MemberRowData = {
  membershipId: string;
  name: string;
  phoneLast4: string;
  amountCents: number;
  note: string;
};

export function MeetingRecorder({
  meetingId,
  groupId,
  members: initialMembers,
  defaultAmountCents,
  locale,
  canManage,
}: {
  meetingId: string;
  groupId: string;
  members: MemberRowData[];
  defaultAmountCents: number;
  locale: string;
  canManage: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [target, setTarget] = useState<ContributionTarget | null>(null);
  const t = useTranslations("meetings");

  const { totalCollected, recordedCount } = useMemo(() => {
    const recorded = members.filter((m) => m.amountCents > 0);
    return {
      totalCollected: recorded.reduce((sum, m) => sum + m.amountCents, 0),
      recordedCount: recorded.length,
    };
  }, [members]);

  function openMember(member: MemberRowData) {
    if (!canManage) return;
    setTarget({
      membershipId: member.membershipId,
      name: member.name,
      amountCents: member.amountCents || defaultAmountCents,
      note: member.note,
    });
  }

  function handleSaved(membershipId: string, amountCents: number) {
    setMembers((prev) =>
      prev.map((m) => (m.membershipId === membershipId ? { ...m, amountCents } : m)),
    );
  }

  return (
    <div className="pb-28">
      <ul className="space-y-2">
        {members.map((member) => {
          const recorded = member.amountCents > 0;
          return (
            <li key={member.membershipId}>
              <button
                type="button"
                disabled={!canManage}
                onClick={() => openMember(member)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-warm-sm transition-all",
                  canManage && "hover:-translate-y-0.5 hover:shadow-warm-lg",
                  !canManage && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    recorded
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {recorded ? (
                    <Check className="size-5" aria-hidden="true" />
                  ) : (
                    <span className="size-2 rounded-full bg-current" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("phoneEndingIn", { digits: member.phoneLast4 })}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-sm font-semibold",
                    recorded ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {recorded ? formatRWF(member.amountCents, locale) : t("notRecorded")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <ContributionDialog
        meetingId={meetingId}
        target={target}
        onOpenChange={(open) => !open && setTarget(null)}
        onSaved={handleSaved}
      />

      {/* Sticky summary bar */}
      <div className="fixed inset-x-4 bottom-24 z-30 rounded-2xl border border-border bg-background/95 p-4 shadow-warm-lg backdrop-blur-md md:inset-x-auto md:bottom-6 md:left-72 md:right-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {t("recordedOf", { recorded: recordedCount, total: members.length })}
            </p>
            <p className="font-display font-semibold text-primary">
              {t("totalCollected")}: {formatRWF(totalCollected, locale)}
            </p>
          </div>
          {canManage && <EndMeetingButton meetingId={meetingId} groupId={groupId} />}
        </div>
      </div>
    </div>
  );
}
