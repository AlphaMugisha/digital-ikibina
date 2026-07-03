import Link from "next/link";
import { CalendarDays, ChevronRight, Users } from "lucide-react";
import type { Role } from "@prisma/client";
import { formatRWF } from "@/lib/money";
import { meetingDayLabel } from "@/lib/days";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ROLE_BORDER: Record<Role, string> = {
  LEADER: "before:bg-primary",
  SECRETARY: "before:bg-accent",
  MEMBER: "before:bg-border",
};

const ROLE_BADGE: Record<Role, string> = {
  LEADER: "bg-primary/10 text-primary",
  SECRETARY: "bg-accent/20 text-accent-foreground",
  MEMBER: "bg-secondary text-muted-foreground",
};

type GroupCardProps = {
  group: {
    id: string;
    name: string;
    contributionAmount: number;
    meetingDay: number;
  };
  memberCount: number;
  role?: Role;
};

export function GroupCard({ group, memberCount, role }: GroupCardProps) {
  return (
    <Link
      href={`/dashboard/groups/${group.id}`}
      className={cn(
        "relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 pl-6 shadow-warm-sm transition-all hover:-translate-y-0.5 hover:shadow-warm-lg",
        "before:absolute before:inset-y-0 before:left-0 before:w-1.5",
        role ? ROLE_BORDER[role] : "before:bg-border",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display truncate text-base font-semibold text-foreground">
            {group.name}
          </h3>
          {role && (
            <Badge
              variant="outline"
              className={cn("rounded-full border-none font-semibold", ROLE_BADGE[role])}
            >
              {role}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm font-semibold text-primary">
          {formatRWF(group.contributionAmount)}
          <span className="font-normal text-muted-foreground"> / icyumweru</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" aria-hidden="true" />
            {memberCount} {memberCount === 1 ? "umunyamuryango" : "abanyamuryango"}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {meetingDayLabel(group.meetingDay)}
          </span>
        </div>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground/50"
        aria-hidden="true"
      />
    </Link>
  );
}
