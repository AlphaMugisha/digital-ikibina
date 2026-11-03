"use client";

import { useState, useId } from "react";
import { Calculator, Sparkles, TrendingUp, Users, Wallet, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SavingsCalculatorProps {
  className?: string;
}

const PRESETS = [
  { name: "Family Ikibina", members: 12, weekly: 3000, weeks: 26, rate: 5 },
  { name: "Market Traders", members: 25, weekly: 5000, weeks: 36, rate: 10 },
  { name: "Farmer Cooperative", members: 40, weekly: 10000, weeks: 52, rate: 10 },
];

export function SavingsCalculator({ className }: SavingsCalculatorProps) {
  const [members, setMembers] = useState(25);
  const [weeklyAmount, setWeeklyAmount] = useState(5000);
  const [weeks, setWeeks] = useState(36);
  const [interestRate, setInterestRate] = useState(10);

  const membersInputId = useId();
  const weeklyInputId = useId();
  const weeksInputId = useId();
  const rateInputId = useId();

  // Calculations
  const memberPersonalContributed = weeklyAmount * weeks;
  const totalPoolContributions = memberPersonalContributed * members;
  // Assuming ~55% of the pool is lent out across the cycle and earns interest
  const totalInterestEarned = Math.round(totalPoolContributions * 0.55 * (interestRate / 100));
  const memberInterestShare = Math.round(totalInterestEarned / members);
  const memberEstimatedPayout = memberPersonalContributed + memberInterestShare;
  const returnPercentage = ((memberInterestShare / memberPersonalContributed) * 100).toFixed(1);

  const formatRwf = (val: number) => {
    return new Intl.NumberFormat("en-RW", {
      maximumFractionDigits: 0,
    }).format(val) + " RWF";
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-warm-lg transition-all duration-300 hover:shadow-warm-xl sm:p-8 ${className ?? ""}`}>
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-accent/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Calculator className="size-3.5" aria-hidden="true" />
            <span>Interactive VSLA Simulator</span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Simulate Your Group's Cycle
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            See how weekly contributions and cooperative loans compound into real payouts.
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 sm:pt-0">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setMembers(p.members);
                setWeeklyAmount(p.weekly);
                setWeeks(p.weeks);
                setInterestRate(p.rate);
              }}
              className="rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative mt-8 grid gap-8 lg:grid-cols-12">
        {/* Sliders Column */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Slider 1: Members */}
          <div className="rounded-2xl border border-border/60 bg-background/50 p-4 transition-colors hover:border-primary/30">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor={membersInputId} className="flex items-center gap-2 font-semibold text-foreground">
                <Users className="size-4 text-primary" aria-hidden="true" />
                Number of Members
              </label>
              <span className="font-mono text-base font-bold text-primary">{members} members</span>
            </div>
            <input
              id={membersInputId}
              type="range"
              min="5"
              max="60"
              step="1"
              value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
              className="mt-3.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary transition-all"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>5 members</span>
              <span>30 members</span>
              <span>60 members</span>
            </div>
          </div>

          {/* Slider 2: Weekly Contribution */}
          <div className="rounded-2xl border border-border/60 bg-background/50 p-4 transition-colors hover:border-primary/30">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor={weeklyInputId} className="flex items-center gap-2 font-semibold text-foreground">
                <Wallet className="size-4 text-primary" aria-hidden="true" />
                Weekly Contribution per Member
              </label>
              <span className="font-mono text-base font-bold text-primary">{formatRwf(weeklyAmount)}</span>
            </div>
            <input
              id={weeklyInputId}
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={weeklyAmount}
              onChange={(e) => setWeeklyAmount(Number(e.target.value))}
              className="mt-3.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary transition-all"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>1,000 RWF</span>
              <span>10,000 RWF</span>
              <span>20,000 RWF</span>
            </div>
          </div>

          {/* Grid row: Weeks & Rate */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4 transition-colors hover:border-primary/30">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor={weeksInputId} className="font-semibold text-foreground">Cycle Duration</label>
                <span className="font-mono text-sm font-bold text-primary">{weeks} weeks</span>
              </div>
              <input
                id={weeksInputId}
                type="range"
                min="12"
                max="52"
                step="2"
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary transition-all"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>12 wks (3 mo)</span>
                <span>52 wks (1 yr)</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/50 p-4 transition-colors hover:border-primary/30">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor={rateInputId} className="font-semibold text-foreground">Loan Interest Rate</label>
                <span className="font-mono text-sm font-bold text-primary">{interestRate}%</span>
              </div>
              <input
                id={rateInputId}
                type="range"
                min="2"
                max="20"
                step="1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary transition-all"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>2%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Card Column */}
        <div className="flex flex-col justify-between rounded-2xl border border-primary/20 bg-gradient-to-br from-[#143e31] to-[#0c281f] p-6 text-white shadow-warm-lg lg:col-span-5">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#d9f36a]">
                Projected Share-Out
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/90">
                <Sparkles className="size-3 text-[#d9f36a]" />
                +{returnPercentage}% return
              </span>
            </div>

            <div className="mt-5">
              <p className="text-xs text-white/70">Estimated Payout Per Member</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {formatRwf(memberEstimatedPayout)}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-white/60">
                Includes your {formatRwf(memberPersonalContributed)} savings + {formatRwf(memberInterestShare)} loan interest dividend.
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-xl bg-white/5 p-4 text-xs backdrop-blur-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/70">Total Group Savings Pool</span>
                <span className="font-semibold text-white">{formatRwf(totalPoolContributions)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/70">Community Interest Earned</span>
                <span className="font-semibold text-[#d9f36a]">+{formatRwf(totalInterestEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Calculation Method</span>
                <span className="inline-flex items-center gap-1 font-medium text-white/80">
                  <ShieldCheck className="size-3.5 text-[#d9f36a]" /> Standard VSLA Formula
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Button asChild className="h-11 w-full rounded-full bg-[#d9f36a] text-[#143e31] font-semibold hover:bg-[#c9e358] shadow-md transition-all">
              <Link href="/register">
                Start Saving With Your Group <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <p className="mt-2 text-center text-[11px] text-white/50">
              No hidden fees · Free for community groups
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
