"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  CalendarCheck2,
  Check,
  CircleDollarSign,
  HandCoins,
  Landmark,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const icons = {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  CalendarCheck2,
  Check,
  CircleDollarSign,
  HandCoins,
  Landmark,
  ShieldCheck,
  UsersRound,
};

export type LandingGlyphName = keyof typeof icons;

export function LandingGlyph({
  name,
  className,
}: {
  name: LandingGlyphName;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" />;
}
