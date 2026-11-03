"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, MapPin, Users, Award } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  group: string;
  location: string;
  members: number;
  cycle: string;
  avatarInitials: string;
  avatarColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We used to spend 45 minutes every single meeting doing manual calculations in a damp paper notebook. Now, the secretary enters numbers on a phone in 10 minutes, and everyone receives an SMS before leaving the room.",
    name: "Jean-Claude Mugabo",
    role: "Cooperative President",
    group: "Abisunganye Bugesera VSLA",
    location: "Bugesera District, Eastern Province",
    members: 28,
    cycle: "Cycle 4 Active",
    avatarInitials: "JM",
    avatarColor: "bg-emerald-600 text-white",
  },
  {
    quote:
      "Our share-out used to cause disputes because notebooks had pencil smudges and erased figures. With Digital Ibimina, the system calculated 4.2M RWF in payouts with zero Francs missing. Everyone left smiling.",
    name: "Marie Claire Mukamana",
    role: "Group Treasurer",
    group: "Kimironko Market Women Circle",
    location: "Gasabo, Kigali City",
    members: 34,
    cycle: "Cycle 3 Completed",
    avatarInitials: "MM",
    avatarColor: "bg-amber-600 text-white",
  },
  {
    quote:
      "Even our elder members who carry basic button phones trust the platform completely because they receive the SMS in Kinyarwanda. It brought true transparency to our community.",
    name: "Emmanuel Hakizimana",
    role: "Secretary",
    group: "Dukundumurimo Farmers Circle",
    location: "Musanze District, Northern Province",
    members: 42,
    cycle: "Cycle 2 Active",
    avatarInitials: "EH",
    avatarColor: "bg-teal-600 text-white",
  },
];

export function CommunityTestimonials({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((curr) => (curr === 0 ? TESTIMONIALS.length - 1 : curr - 1));
  };

  const next = () => {
    setCurrentIndex((curr) => (curr === TESTIMONIALS.length - 1 ? 0 : curr + 1));
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section className={`py-16 sm:py-24 bg-secondary/30 border-y border-border/70 ${className ?? ""}`}>
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Quote className="size-3.5" />
            <span>Community Stories</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved By Leaders And Savers Alike
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hear from cooperative leaders across Rwanda who retired their paper notebooks.
          </p>
        </div>

        {/* Featured Testimonial Card */}
        <div className="relative mx-auto mt-12 max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 shadow-warm-lg sm:p-12">
            {/* Background quote mark */}
            <Quote className="pointer-events-none absolute right-8 top-8 size-28 text-muted/30" />

            <div className="relative z-10">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
                ))}
                <span className="ml-2 text-xs font-semibold text-foreground">Verified VSLA Leader</span>
              </div>

              <blockquote className="mt-6 text-lg font-medium leading-relaxed text-foreground sm:text-xl md:text-2xl">
                “{current.quote}”
              </blockquote>

              <div className="mt-8 flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className={`grid size-12 place-items-center rounded-2xl font-bold text-sm shadow-warm-sm ${current.avatarColor}`}>
                    {current.avatarInitials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm sm:text-base">{current.name}</p>
                    <p className="text-xs text-muted-foreground">{current.role} · {current.group}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
                    <MapPin className="size-3 text-primary" /> {current.location}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
                    <Users className="size-3 text-primary" /> {current.members} members
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Award className="size-3" /> {current.cycle}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === i ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous story"
                className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-all hover:border-primary hover:bg-secondary"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next story"
                className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-all hover:border-primary hover:bg-secondary"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
