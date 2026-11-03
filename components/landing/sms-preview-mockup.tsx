"use client";

import { useState } from "react";
import { MessageSquare, Bell, CheckCircle2, Smartphone, ShieldCheck, Wifi, BatteryCharging } from "lucide-react";

interface SmsMessage {
  id: string;
  category: string;
  sender: string;
  time: string;
  title: string;
  kinyarwanda: string;
  english: string;
  amount: string;
  status: string;
}

const SMS_SAMPLES: SmsMessage[] = [
  {
    id: "contribution",
    category: "Weekly Contribution",
    sender: "IKIBINA-SMS",
    time: "Today, 10:14 AM",
    title: "Contribution Confirmed",
    kinyarwanda: "Ubwishyu: RWF 5,000 yakiriwe muri Ibimina Abahuje. Umutungo wawe ubu ni RWF 65,000. Inama itaha: Kuwa Gatatu.",
    english: "Contribution: RWF 5,000 received in Abahuje Group. Your current savings balance is RWF 65,000. Next meeting: Wednesday.",
    amount: "+5,000 RWF",
    status: "Verified On Ledger",
  },
  {
    id: "loan",
    category: "Loan Disbursed",
    sender: "IKIBINA-SMS",
    time: "Yesterday, 3:30 PM",
    title: "Loan Approved & Sent",
    kinyarwanda: "Inguzanyo: RWF 40,000 yemejwe na Komite. Inyungu: 5%. Itariki yo kwishyura: 15/12/2026. Umwishingizi: Keza Marie.",
    english: "Loan: RWF 40,000 approved by Committee. Interest: 5%. Due date: 15/12/2026. Guarantor: Keza Marie.",
    amount: "40,000 RWF",
    status: "Disbursed",
  },
  {
    id: "shareout",
    category: "Cycle Share-Out",
    sender: "IKIBINA-SMS",
    time: "Cycle Close",
    title: "Final Payout Distributed",
    kinyarwanda: "Igemura rya Cycle 3: RWF 198,200 yishyuwe. Ubwizigame: RWF 170,000 + Inyungu: RWF 28,200. Murakoze!",
    english: "Cycle 3 Share-Out: RWF 198,200 paid out. Savings: RWF 170,000 + Dividend: RWF 28,200. Thank you for saving!",
    amount: "198,200 RWF",
    status: "Completed",
  },
];

export function SmsPreviewMockup({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<string>("contribution");
  const [lang, setLang] = useState<"rw" | "en">("rw");

  const currentSample = SMS_SAMPLES.find((s) => s.id === activeTab) || SMS_SAMPLES[0];

  return (
    <div className={`relative mx-auto flex w-full max-w-md flex-col items-center ${className ?? ""}`}>
      {/* Glow aura */}
      <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 to-accent/20 blur-xl opacity-70" />

      {/* Phone container */}
      <div className="relative w-full rounded-[2.5rem] border-4 border-slate-800 bg-slate-950 p-4 shadow-2xl text-slate-100">
        {/* Notch / Speaker bar */}
        <div className="mx-auto mb-3 flex h-4 w-28 items-center justify-center rounded-full bg-slate-900">
          <div className="h-1.5 w-10 rounded-full bg-slate-800" />
          <div className="ml-2 size-2 rounded-full bg-slate-800" />
        </div>

        {/* Screen header */}
        <div className="flex items-center justify-between px-3 text-[11px] text-slate-400 font-mono">
          <span>09:41</span>
          <div className="flex items-center gap-2">
            <Wifi className="size-3" />
            <BatteryCharging className="size-3.5 text-emerald-400" />
          </div>
        </div>

        {/* App Title in phone */}
        <div className="mt-3 flex items-center justify-between border-b border-slate-800/80 px-2 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-full bg-primary/20 text-primary">
              <MessageSquare className="size-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">{currentSample.sender}</p>
              <p className="text-[10px] text-slate-400">Official SMS Gateway</p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" /> Instant
          </span>
        </div>

        {/* Language selector toggle inside phone */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900/90 p-1 text-xs">
          <span className="px-2 text-[11px] text-slate-400 font-medium">Message Language:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setLang("rw")}
              className={`rounded-lg px-2.5 py-0.5 text-[11px] font-semibold transition ${
                lang === "rw" ? "bg-primary text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Kinyarwanda
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-lg px-2.5 py-0.5 text-[11px] font-semibold transition ${
                lang === "en" ? "bg-primary text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Simulated Message bubble */}
        <div className="mt-4 min-h-[170px] rounded-2xl bg-slate-900 p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
              {currentSample.title}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{currentSample.time}</span>
          </div>

          <p className="mt-2.5 text-xs leading-relaxed text-slate-200 font-sans">
            {lang === "rw" ? currentSample.kinyarwanda : currentSample.english}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px]">
            <span className="text-slate-400 font-mono text-[10px]">Amount: {currentSample.amount}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <ShieldCheck className="size-3" /> {currentSample.status}
            </span>
          </div>
        </div>

        {/* Event selector tabs */}
        <div className="mt-4 flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            Preview Event Triggers
          </p>
          <div className="grid grid-cols-3 gap-1">
            {SMS_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => setActiveTab(sample.id)}
                className={`rounded-xl px-2 py-1.5 text-center text-[10px] font-semibold transition-all ${
                  activeTab === sample.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {sample.category.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Footer note in mockup */}
        <div className="mt-4 rounded-xl bg-slate-900/40 p-2 text-center text-[10px] text-slate-400">
          <span className="text-emerald-400 font-medium">100% Offline Compatible:</span> Works on any MTN or Airtel phone via SMS & USSD.
        </div>
      </div>
    </div>
  );
}
