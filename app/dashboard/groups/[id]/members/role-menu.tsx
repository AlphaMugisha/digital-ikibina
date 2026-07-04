"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateMemberRole } from "./actions";

const ASSIGNABLE_ROLES: Role[] = ["SECRETARY", "MEMBER"];

export function RoleMenu({
  groupId,
  membershipId,
  currentRole,
}: {
  groupId: string;
  membershipId: string;
  currentRole: Role;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("members");

  function handleSelect(role: Role) {
    startTransition(async () => {
      const result = await updateMemberRole(groupId, membershipId, role);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("roleUpdated"));
      router.refresh();
    });
  }

  const roleLabel: Record<Role, string> = {
    SECRETARY: t("makeSecretary"),
    MEMBER: t("makeMember"),
    LEADER: t("makeLeader"),
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label={t("changeRole")}
          className="size-11 shrink-0 rounded-full"
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ASSIGNABLE_ROLES.filter((role) => role !== currentRole).map((role) => (
          <DropdownMenuItem key={role} onClick={() => handleSelect(role)}>
            {roleLabel[role]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
