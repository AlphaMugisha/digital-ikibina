"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { AttendanceStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { recordAttendance, type AttendanceEntry } from "./attendance-actions";

export type AttendanceRowData = {
  membershipId: string;
  name: string;
  status: AttendanceStatus;
  chargeFine: boolean;
};

const STATUSES: AttendanceStatus[] = ["PRESENT", "ABSENT", "EXCUSED", "LATE"];

export function AttendanceRecorder({
  meetingId,
  members: initialMembers,
  canManage,
}: {
  meetingId: string;
  members: AttendanceRowData[];
  canManage: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("attendance");

  function setStatus(membershipId: string, status: AttendanceStatus) {
    if (!canManage) return;
    setMembers((prev) =>
      prev.map((m) => (m.membershipId === membershipId ? { ...m, status, chargeFine: false } : m)),
    );
  }

  function toggleChargeFine(membershipId: string) {
    setMembers((prev) =>
      prev.map((m) => (m.membershipId === membershipId ? { ...m, chargeFine: !m.chargeFine } : m)),
    );
  }

  function handleSave() {
    const entries: AttendanceEntry[] = members.map((m) => ({
      membershipId: m.membershipId,
      status: m.status,
      chargeFine: m.chargeFine,
    }));
    startTransition(async () => {
      const result = await recordAttendance(meetingId, entries);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("saved"));
      router.refresh();
    });
  }

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("title")}
      </h2>
      <ul className="mt-3 space-y-2">
        {members.map((member) => (
          <li key={member.membershipId} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-medium text-foreground">{member.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={!canManage}
                  onClick={() => setStatus(member.membershipId, status)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    member.status === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {t(status.toLowerCase() as "present")}
                </button>
              ))}
            </div>
            {member.status === "ABSENT" && (
              <p className="mt-2 text-xs text-destructive">{t("fineAppliedNotice")}</p>
            )}
            {member.status === "LATE" && canManage && (
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={member.chargeFine}
                  onChange={() => toggleChargeFine(member.membershipId)}
                  className="size-4 rounded border-input"
                />
                {t("chargeFineLabel")}
              </label>
            )}
          </li>
        ))}
      </ul>

      {canManage && (
        <Button
          type="button"
          className="mt-4 h-11 w-full rounded-full sm:w-auto"
          disabled={isPending}
          onClick={handleSave}
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("recordAttendance")}
        </Button>
      )}
    </div>
  );
}
