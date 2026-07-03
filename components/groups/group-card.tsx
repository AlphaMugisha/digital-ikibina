import Link from "next/link";
import { CalendarDays, ChevronRight, Users } from "lucide-react";
import type { Role } from "@prisma/client";
import { formatRWF } from "@/lib/money";
import { meetingDayLabel } from "@/lib/days";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<Role, string> = {
  LEADER: "bg-amber-100 text-amber-800",
  SECRETARY: "bg-sky-100 text-sky-800",
  MEMBER: "bg-slate-100 text-slate-600",
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
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-emerald-950">
            {group.name}
          </h3>
          {role && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                ROLE_STYLES[role],
              )}
            >
              {role}
            </span>
          )}
        </div>
        <p className="mt-1 font-mono text-sm text-emerald-700">
          {formatRWF(group.contributionAmount)}
          <span className="font-sans text-slate-400"> / icyumweru</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
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
        className="size-5 shrink-0 text-slate-300"
        aria-hidden="true"
      />
    </Link>
  );
}
