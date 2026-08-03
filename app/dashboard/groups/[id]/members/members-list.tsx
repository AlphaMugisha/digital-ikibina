"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Role } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { formatRWF } from "@/lib/money";
import { RoleMenu } from "./role-menu";

export type MemberRow = {
  id: string;
  name: string;
  phone: string;
  role: Role;
  joinedAt: string;
  totalContributed: number;
  activeLoanAmount: number;
  meetingsAttended: number;
  meetingsTotal: number;
};

const ROLE_BADGE: Record<Role, string> = {
  LEADER: "bg-primary/10 text-primary",
  SECRETARY: "bg-accent/20 text-accent-foreground",
  MEMBER: "bg-secondary text-muted-foreground",
};

const ROLE_RANK: Record<Role, number> = { LEADER: 0, SECRETARY: 1, MEMBER: 2 };

type SortKey = "name" | "contribution" | "role" | "recent";

export function MembersList({
  groupId,
  rows,
  canManage,
}: {
  groupId: string;
  rows: MemberRow[];
  canManage: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const t = useTranslations("members");
  const tGroups = useTranslations("groups");
  const locale = useLocale();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? rows.filter((r) => r.name.toLowerCase().includes(q) || r.phone.includes(q))
      : rows;

    const sorted = [...matched].sort((a, b) => {
      switch (sortKey) {
        case "contribution":
          return b.totalContributed - a.totalContributed;
        case "role":
          return ROLE_RANK[a.role] - ROLE_RANK[b.role];
        case "recent":
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [rows, query, sortKey]);

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "name", label: t("sortName") },
    { value: "contribution", label: t("sortContribution") },
    { value: "role", label: t("sortRole") },
    { value: "recent", label: t("sortRecent") },
  ];

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-11 rounded-full pl-11 text-base"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSortKey(opt.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              sortKey === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Wallet} title={t("noMembersFound")} subtitle="" />
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {filtered.map((m) => (
            <li key={m.id}>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-warm-sm">
                <Link href={`/dashboard/groups/${groupId}/members/${m.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {m.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-foreground">{m.name}</span>
                      <Badge
                        variant="outline"
                        className={`rounded-full border-none font-semibold ${ROLE_BADGE[m.role]}`}
                      >
                        {tGroups(`role${m.role.charAt(0)}${m.role.slice(1).toLowerCase()}` as "roleLeader")}
                      </Badge>
                      {m.activeLoanAmount > 0 && (
                        <span className="text-xs text-destructive">
                          {t("borrowingIndicator")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {t("totalContributed")}:{" "}
                      <span className="font-semibold text-primary">
                        {formatRWF(m.totalContributed, locale)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("attendanceRate", { present: m.meetingsAttended, total: m.meetingsTotal })}
                    </p>
                  </div>
                </Link>
                {canManage && m.role !== "LEADER" && (
                  <RoleMenu groupId={groupId} membershipId={m.id} currentRole={m.role} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
