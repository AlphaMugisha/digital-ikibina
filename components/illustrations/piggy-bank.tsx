export function PiggyBankIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="100" cy="146" rx="70" ry="8" fill="var(--color-primary)" opacity="0.08" />
      <path
        d="M55 95c0-30 20-52 50-52s50 22 50 52-20 40-50 40-50-10-50-40Z"
        fill="var(--color-primary)"
        opacity="0.12"
      />
      <path
        d="M60 96c0-27 18-47 45-47s45 20 45 47-18 36-45 36-45-9-45-36Z"
        fill="var(--color-primary)"
      />
      <circle cx="128" cy="80" r="4.5" fill="var(--color-primary-foreground)" />
      <path
        d="M96 46c-4-8-14-12-22-9"
        stroke="var(--color-primary)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="98" y="60" width="14" height="6" rx="3" fill="var(--color-accent)" />
      <path d="M62 108l-10 14M148 108l10 14M85 132l-4 16M125 132l4 16" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" />
      <g>
        <ellipse cx="100" cy="30" rx="16" ry="6" fill="var(--color-accent)" />
        <rect x="84" y="18" width="32" height="12" rx="6" fill="var(--color-accent)" />
        <ellipse cx="100" cy="18" rx="16" ry="6" fill="var(--color-accent)" />
      </g>
    </svg>
  );
}
