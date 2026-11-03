"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Do all our group members need smartphones?",
    answer:
      "No! Only the group secretary or leader needs a smartphone, tablet, or laptop to record the meeting. Regular members can use any basic button phone (feature phone) and will receive instant SMS receipts in Kinyarwanda or English after every contribution.",
  },
  {
    question: "How does Digital Ibimina calculate the final share-out?",
    answer:
      "The platform strictly follows the internationally recognized VSLA (Village Savings and Loan Association) formula: each member receives their entire contributed savings plus their exact proportional share of all interest earned from loans and meeting fines. Active unpaid loans are deducted transparently with zero rounding errors.",
  },
  {
    question: "Can we customize our group's rules and interest rates?",
    answer:
      "Yes. Every group creates a digital constitution where you configure weekly share dues, meeting frequency, loan interest rate (e.g. 5% or 10%), maximum loan multipliers (e.g. 3x savings), repayment windows, and whether loans require peer guarantors.",
  },
  {
    question: "What happens if our meeting place has no internet connection?",
    answer:
      "Digital Ibimina is built to handle low-connectivity environments. You can prepare meeting records offline and sync them as soon as connectivity resumes. SMS receipts are queued and dispatched through local telecom gateways (MTN & Airtel Rwanda).",
  },
  {
    question: "Is our group's financial data private and secure?",
    answer:
      "Yes. Your records are protected with bank-grade encryption and PIN-based member authorization. Only verified members of your group can access your group's details, and data is backed up to secure cloud storage daily so lost notebooks are never an issue again.",
  },
  {
    question: "Is Digital Ibimina free to use for our community?",
    answer:
      "Yes! Creating an account, starting your group, recording contributions, and simulating share-outs is 100% free. There are no credit cards required, and any Rwandan community group can get started in less than two minutes.",
  },
];

export function FaqSection({ className }: { className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className={`scroll-mt-20 py-16 sm:py-24 ${className ?? ""}`}>
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
            <HelpCircle className="size-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need To Know
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Common questions from leaders, secretaries, and members moving from paper notebooks to Digital Ibimina.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-12 space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-primary/40 bg-card shadow-warm-md"
                    : "border-border/70 bg-card/60 hover:border-primary/25 hover:bg-card"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-foreground text-sm sm:text-base"
                >
                  <span className="pr-4">{faq.question}</span>
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full bg-secondary transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <ChevronDown className="size-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm leading-relaxed text-muted-foreground border-t border-border/40 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
