"use client";

import { useState } from "react";
import { Check, Clock, FileCheck, Landmark, PiggyBank, RotateCw, Users } from "lucide-react";

interface Phase {
  id: string;
  stepNumber: string;
  badge: string;
  title: string;
  subtitle: string;
  details: string[];
  mockupTitle: string;
  mockupContent: {
    label: string;
    value: string;
    highlight?: boolean;
  }[];
}

const PHASES: Phase[] = [
  {
    id: "setup",
    stepNumber: "01",
    badge: "Foundation",
    title: "Group Constitution & Roles",
    subtitle: "Establish ground rules, roles, and weekly share amounts in under five minutes.",
    details: [
      "Select meeting schedule (Weekly, Bi-weekly, Monthly)",
      "Designate Leader, Secretary, and Member roles",
      "Set loan interest rate (e.g. 5% – 10%) and maximum borrowing multipliers",
      "Members review and digitally sign the cooperative constitution",
    ],
    mockupTitle: "Constitution Initialized",
    mockupContent: [
      { label: "Group Name", value: "Abisunganye VSLA" },
      { label: "Weekly Share", value: "5,000 RWF / member" },
      { label: "Borrowing Multiplier", value: "3x Contributed" },
      { label: "Constitution Status", value: "Agreed by all 24 members", highlight: true },
    ],
  },
  {
    id: "meetings",
    stepNumber: "02",
    badge: "Active Operations",
    title: "Weekly Inama & Peer Loans",
    subtitle: "The secretary logs everyone's contributions in seconds while SMS receipts fly out.",
    details: [
      "Record attendance & contributions in under 90 seconds per meeting",
      "Members request loans from available pool with 1-click guarantor backing",
      "Instant SMS notification to members confirming receipt and updated balance",
      "Zero bookkeeping math needed — pool balances compute automatically",
    ],
    mockupTitle: "Meeting #14 in Progress",
    mockupContent: [
      { label: "Collected Today", value: "120,000 RWF" },
      { label: "New Loan Issued", value: "50,000 RWF (To Keza M.)" },
      { label: "Guarantor", value: "Jean-Claude M. (Approved)" },
      { label: "SMS Confirmation", value: "Delivered to 24/24", highlight: true },
    ],
  },
  {
    id: "shareout",
    stepNumber: "03",
    badge: "Grand Finale",
    title: "Automated Fair Share-Out",
    subtitle: "When the cycle concludes, calculate every member's exact capital plus interest yield.",
    details: [
      "100% fair mathematical formula: (Member Savings / Total Savings) × Pool",
      "No manual calculation errors or disputes over rounding",
      "Automatic deduction of any outstanding loan balances",
      "Draft preview for leader review before finalizing and disbursing",
    ],
    mockupTitle: "Cycle 1 Share-Out Summary",
    mockupContent: [
      { label: "Total Capital Pool", value: "4,680,000 RWF" },
      { label: "Total Interest Earned", value: "+380,000 RWF" },
      { label: "Member Average Return", value: "+8.1% gain", highlight: true },
      { label: "Audit Ledger", value: "100% Balanced" },
    ],
  },
  {
    id: "rollover",
    stepNumber: "04",
    badge: "Continuous Growth",
    title: "Cycle Rollover & Credit History",
    subtitle: "Begin Cycle 2 with one tap, carrying over trusted member credit ratings.",
    details: [
      "Roll over active members directly into the new cycle",
      "Option to adjust weekly contribution amounts or interest terms",
      "Preserves borrowing limits and credit reputation history",
      "Complete historical archive of past cycles accessible anytime",
    ],
    mockupTitle: "Cycle Rollover Complete",
    mockupContent: [
      { label: "New Cycle", value: "Cycle 2 (36 Weeks)" },
      { label: "Retained Members", value: "24 of 24 members" },
      { label: "Starting Capital", value: "Ready for Day 1" },
      { label: "Credit History", value: "100% On-Time Record", highlight: true },
    ],
  },
];

export function CycleTimeline({ className }: { className?: string }) {
  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  const current = PHASES[selectedPhase];

  return (
    <section className={`py-16 sm:py-24 ${className ?? ""}`}>
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            The Complete Lifecycle
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How an Ikibina Operates from Start to Finish
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Digital Ibimina guides your group seamlessly through all four phases of the traditional cooperative cycle.
          </p>
        </div>

        {/* Phase selector tabs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {PHASES.map((phase, idx) => {
            const isSelected = selectedPhase === idx;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhase(idx)}
                className={`group flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-warm-md"
                    : "border-border/80 bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ${isSelected ? "bg-white text-primary" : "bg-muted text-muted-foreground"}`}>
                  {phase.stepNumber}
                </span>
                <span>{phase.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Card */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-warm-lg sm:p-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left: Details */}
            <div className="flex flex-col justify-center lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <span>Phase {current.stepNumber}</span>
                <span>·</span>
                <span>{current.badge}</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {current.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {current.subtitle}
              </p>

              <div className="mt-6 space-y-3">
                {current.details.map((detail, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3.5" />
                    </span>
                    <span className="text-xs leading-relaxed text-foreground/90 sm:text-sm">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Mockup card */}
            <div className="relative rounded-2xl border border-border/70 bg-gradient-to-br from-secondary/50 to-background p-6 shadow-warm-sm lg:col-span-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold text-foreground">
                  {current.mockupTitle}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3" /> Live State
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {current.mockupContent.map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-xl p-3 text-xs ${
                      row.highlight
                        ? "bg-primary/10 border border-primary/20 text-primary font-semibold"
                        : "bg-background/80 border border-border/40 text-muted-foreground"
                    }`}
                  >
                    <span>{row.label}</span>
                    <span className={row.highlight ? "font-bold text-primary" : "font-medium text-foreground"}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3 text-primary" /> Auto-synchronized
                </span>
                <span>Audit Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
