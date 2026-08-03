"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { respondToInvitation } from "@/app/dashboard/groups/[id]/members/actions";

export type InvitationRow = {
  id: string;
  groupId: string;
  groupName: string;
  inviterName: string;
};

export function PendingInvitations({ invitations: initial }: { invitations: InvitationRow[] }) {
  const [invitations, setInvitations] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("dashboard");

  function respond(invitation: InvitationRow, accept: boolean) {
    setPendingId(invitation.id);
    startTransition(async () => {
      const result = await respondToInvitation(invitation.id, accept);
      if (!result.ok) {
        toast.error(result.error);
        setPendingId(null);
        return;
      }
      toast.success(
        accept
          ? t("invitationAccepted", { group: invitation.groupName })
          : t("invitationDeclined"),
      );
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
      setPendingId(null);
      if (accept) {
        // Send them to the constitution first, so new members read the
        // group's rules before doing anything else.
        router.push(`/dashboard/groups/${invitation.groupId}/constitution`);
      } else {
        router.refresh();
      }
    });
  }

  if (invitations.length === 0) return null;

  return (
    <div className="mb-4 space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("invitationsTitle")}
      </h2>
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="rounded-2xl border border-border bg-accent/10 p-4 shadow-warm-sm"
        >
          <p className="text-sm text-foreground">
            {t("invitedToJoin", { leader: invitation.inviterName, group: invitation.groupName })}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              className="h-10 flex-1 rounded-full"
              disabled={isPending && pendingId === invitation.id}
              onClick={() => respond(invitation, true)}
            >
              {isPending && pendingId === invitation.id ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="size-4" aria-hidden="true" />
              )}
              {t("approve")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 rounded-full"
              disabled={isPending && pendingId === invitation.id}
              onClick={() => respond(invitation, false)}
            >
              <X className="size-4" aria-hidden="true" />
              {t("decline")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
