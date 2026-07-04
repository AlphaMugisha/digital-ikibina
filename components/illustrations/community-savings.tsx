/** People contributing to a shared savings pool — for use on solid emerald backgrounds. */
export function CommunitySavingsIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} fill="none" aria-hidden="true">
      {/* Left person */}
      <circle cx="62" cy="72" r="13" fill="var(--color-primary-foreground)" opacity="0.7" />
      <path
        d="M47 88h30l5 46H42l5-46Z"
        fill="var(--color-primary-foreground)"
        opacity="0.7"
      />

      {/* Right person */}
      <circle cx="178" cy="72" r="13" fill="var(--color-primary-foreground)" opacity="0.7" />
      <path
        d="M163 88h30l5 46h-40l5-46Z"
        fill="var(--color-primary-foreground)"
        opacity="0.7"
      />

      {/* Center person (front) */}
      <circle cx="120" cy="58" r="15" fill="var(--color-primary-foreground)" />
      <path d="M103 75h34l6 54h-46l6-54Z" fill="var(--color-primary-foreground)" />

      {/* Shared basket */}
      <ellipse cx="120" cy="151" rx="44" ry="10" fill="var(--color-primary-foreground)" />
      <path
        d="M78 151h84l-10 36a8 8 0 0 1-8 6H96a8 8 0 0 1-8-6l-10-36Z"
        fill="var(--color-primary-foreground)"
      />
      <path
        d="M92 157h56M88 168h64M92 179h56"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeOpacity="0.25"
        strokeLinecap="round"
      />

      {/* Coins going in */}
      <circle cx="120" cy="136" r="10" fill="var(--color-accent)" />
      <circle cx="102" cy="142" r="7" fill="var(--color-accent)" opacity="0.85" />
      <circle cx="138" cy="142" r="7" fill="var(--color-accent)" opacity="0.85" />
    </svg>
  );
}
