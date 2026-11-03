"use client";

import { useState } from "react";
import { HandCoins, Calculator, ShieldCheck, Smartphone, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FeatureTab {
  id: string;
  icon: typeof HandCoins;
  title: string;
  shortDesc: string;
  headline: string;
  description: string;
  points: string[];
  mockupBadge: string;
  mockupHeader: string;
  mockupItems: {
    title: string;
    sub: string;
    amount?: string;
    status: string;
    statusType?: "success" | "warning" | "neutral";
  }[];
}

const FEATURE_TABS: FeatureTab[] = [
  {
    id: "meetings",
    icon: HandCoins,
    title: "Fast Meeting Mode",
    shortDesc: "Log 30 members in 2 mins",
    headline: "Record Contributions Faster Than Paper Ever Could",
    description:
      "During the weekly meeting, the secretary simply taps through member names. No calculating totals by hand, no smudged pages, no lost receipts.",
    points: [
      "1-tap contribution logging with default amount pre-filled",
      "Late fines and attendance recorded simultaneously",
      "Instant real-time group pool balance update",
      "Secretary ends meeting and SMS receipts are dispatched automatically",
    ],
    mockupBadge: "Inama Live Record",
    mockupHeader: "Meeting #12 · Kigali Central",
    mockupItems: [
      { title: "Jean-Claude Mugabo", sub: "Regular Weekly Share", amount: "5,000 RWF", status: "Recorded", statusType: "success" },
      { title: "Aline Uwase", sub: "Regular + Emergency Fund", amount: "7,000 RWF", status: "Recorded", statusType: "success" },
      { title: "Eric Habimana", sub: "Late arrival (+200 RWF fine)", amount: "5,200 RWF", status: "Recorded", statusType: "warning" },
    ],
  },
  {
    id: "loans",
    icon: Calculator,
    title: "Transparent Lending",
    shortDesc: "Guarantors & auto-interest",
    headline: "Loans Governed By Your Group's Rules, Not Guesswork",
    description:
      "Members can request emergency or business loans up to their constitution limit. The system enforces policy limits and calculates due dates automatically.",
    points: [
      "Borrowing limit calculated automatically based on personal savings",
      "Peer guarantor approval workflow before leader sign-off",
      "Fair and transparent interest calculation (reducing or flat rate)",
      "Proactive SMS payment reminders before due dates",
    ],
    mockupBadge: "Loan Portfolio",
    mockupHeader: "Active Borrowing Ledger",
    mockupItems: [
      { title: "Marie Claire Mukamana", sub: "Produce Inventory · Due in 22 days", amount: "60,000 RWF", status: "On Track", statusType: "success" },
      { title: "David Nzeyimana", sub: "School Fees Loan · Due in 8 days", amount: "30,000 RWF", status: "Upcoming", statusType: "neutral" },
      { title: "Patrick Sibomana", sub: "Guarantor: Eric H. · Pending sign-off", amount: "45,000 RWF", status: "Review", statusType: "warning" },
    ],
  },
  {
    id: "shareout",
    icon: ShieldCheck,
    title: "Error-Free Share-Out",
    shortDesc: "100% fair payout formula",
    headline: "End Every Cycle With Confidence And Zero Discrepancies",
    description:
      "No more sleepless nights trying to reconcile notebooks. The automated share-out engine calculates each member's exact capital and interest earnings down to the Franc.",
    points: [
      "Calculates savings return + dividend based on individual contribution weight",
      "Automatically deducts any outstanding debts or uncollected fines",
      "Draft preview for committee audit before final disbursement",
      "Complete historical certificate generated for each member",
    ],
    mockupBadge: "Cycle Finale",
    mockupHeader: "Share-Out Distribution",
    mockupItems: [
      { title: "Pool Total Collected", sub: "Savings + Interest Dividend", amount: "3,850,000 RWF", status: "Audited", statusType: "success" },
      { title: "Average Member Return", sub: "Reflects 36 weeks of active lending", amount: "+8.4%", status: "Yield", statusType: "success" },
      { title: "Ledger Discrepancy", sub: "Mathematical precision check", amount: "0 RWF", status: "Perfect", statusType: "success" },
    ],
  },
  {
    id: "offline",
    icon: Smartphone,
    title: "SMS & USSD Ready",
    shortDesc: "No smartphone required",
    headline: "Accessible to Every Single Rwandan Member",
    description:
      "Only the group secretary or leader needs a smartphone or computer. All other members can participate with basic button phones via automatic SMS alerts.",
    points: [
      "SMS confirmations delivered via MTN and Airtel Rwanda networks",
      "Full Kinyarwanda language support out of the box",
      "Members check balance via simple phone triggers",
      "Financial inclusion that leaves no member behind",
    ],
    mockupBadge: "Telco Gateway",
    mockupHeader: "Africa's Talking SMS Dispatch",
    mockupItems: [
      { title: "+250 788 123 456", sub: "Kinyarwanda SMS Receipt sent", amount: "0788...", status: "Delivered", statusType: "success" },
      { title: "+250 722 987 654", sub: "Balance inquiry response sent", amount: "0722...", status: "Delivered", statusType: "success" },
      { title: "+250 733 456 789", sub: "Meeting reminder sent", amount: "0733...", status: "Delivered", statusType: "success" },
    ],
  },
];

export function FeatureTabs({ className }: { className?: string }) {
  const [activeTabId, setActiveTabId] = useState<string>("meetings");
  const current = FEATURE_TABS.find((t) => t.id === activeTabId) || FEATURE_TABS[0];

  return (
    <section className={`py-16 sm:py-24 ${className ?? ""}`}>
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Engineered For Savings Groups
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need To Run Transparent Ibimina
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Designed specifically around the rituals and governance rules of Rwandan savings circles and VSLAs.
          </p>
        </div>

        {/* Tab navigation bar */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FEATURE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-warm-sm"
                    : "border-border/70 bg-card hover:border-primary/30 hover:bg-secondary/40"
                }`}
              >
                <span className={`grid size-9 place-items-center rounded-xl transition ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="size-4" />
                </span>
                <span className={`mt-3 text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                  {tab.title}
                </span>
                <span className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                  {tab.shortDesc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected tab display */}
        <div className="mt-8 rounded-3xl border border-border/80 bg-card p-6 shadow-warm-lg sm:p-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Description & bullet points */}
            <div className="flex flex-col justify-center lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Featured Capability
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {current.headline}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {current.description}
              </p>

              <div className="mt-6 space-y-3">
                {current.points.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" />
                    </span>
                    <span className="text-xs leading-relaxed text-foreground/90 sm:text-sm">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button asChild className="h-11 rounded-full px-6">
                  <Link href="/register">
                    Try This For Free <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Interactive Mockup Card */}
            <div className="rounded-2xl border border-border/80 bg-secondary/30 p-5 shadow-warm-sm lg:col-span-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <p className="text-xs font-bold text-foreground">{current.mockupHeader}</p>
                  <p className="text-[10px] text-muted-foreground">Digital Ibimina Ledger</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  {current.mockupBadge}
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {current.mockupItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 shadow-warm-sm"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                    </div>
                    <div className="text-right">
                      {item.amount && (
                        <p className="text-xs font-mono font-bold text-foreground">{item.amount}</p>
                      )}
                      <span
                        className={`inline-block text-[10px] font-semibold ${
                          item.statusType === "success"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : item.statusType === "warning"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-card/60 p-2.5 text-center text-[11px] text-muted-foreground border border-border/40">
                Encrypted end-to-end · Audit log synchronized
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
