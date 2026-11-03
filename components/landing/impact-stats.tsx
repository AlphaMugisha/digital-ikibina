"use client";

import { TrendingUp, Users, ShieldCheck, BookX, Award } from "lucide-react";

interface StatItem {
  icon: typeof TrendingUp;
  value: string;
  unit?: string;
  label: string;
  description: string;
  badge: string;
  color: string;
}

const STATS: StatItem[] = [
  {
    icon: TrendingUp,
    value: "148M+",
    unit: "RWF",
    label: "Community Capital Tracked",
    description: "Safely collected, recorded, and distributed with zero ledger discrepancies.",
    badge: "+24% this quarter",
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Users,
    value: "1,250+",
    unit: "Members",
    label: "Active Savers & Borrowers",
    description: "Across 85+ active savings circles across Kigali and rural districts.",
    badge: "85 active groups",
    color: "from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: ShieldCheck,
    value: "99.4%",
    unit: "Repaid",
    label: "Loan Repayment Rate",
    description: "Powered by peer-guarantor approval and clear SMS reminders.",
    badge: "Social trust",
    color: "from-blue-500/20 to-cyan-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: BookX,
    value: "0",
    unit: "Losses",
    label: "Lost Paper Records",
    description: "Cloud-synced meeting minutes and immutable digital transaction ledgers.",
    badge: "100% backed up",
    color: "from-rose-500/20 to-pink-500/10 text-rose-600 dark:text-rose-400",
  },
];

export function ImpactStats({ className }: { className?: string }) {
  return (
    <section className={`py-12 sm:py-16 ${className ?? ""}`}>
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
            <Award className="size-3.5" />
            <span>Proven Community Impact</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Trusted by Rwandan Cooperatives
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            From urban savings circles to agricultural VSLAs, groups run smoother and grow faster with Digital Ibimina.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-warm-lg"
              >
                <div className="flex items-center justify-between">
                  <span className={`grid size-11 place-items-center rounded-2xl bg-gradient-to-br ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {stat.badge}
                  </span>
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                      {stat.value}
                    </span>
                    {stat.unit && (
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        {stat.unit}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    {stat.label}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
