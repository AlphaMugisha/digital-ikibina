# Profile experience redesign

Date: 2026-11-10
Status: approved

## Goal

Replace the placeholder `/dashboard/profile` page (an avatar, a phone number, a
language switcher and a sign-out button) with a profile experience that carries
its weight in a financial product: identity, memberships, money and account
security, each with real data behind it.

## Constraint that shapes everything

No schema migration. The production Neon database holds real users, groups and
loans, so this work adds no columns and no tables. Every value displayed comes
from a column that exists today.

That rules out several requested features, because the data to back them does
not exist:

| Requested | Why it is omitted |
| --- | --- |
| Email, address, date of birth, profile photo | No columns on `User` |
| Account verification status | No column; nothing computes it |
| Two-factor authentication | No secret/enrolment storage |
| Active sessions, device management | Auth.js runs `strategy: "jwt"`; there is no session table to enumerate |
| Login history | Nothing records login events |
| Notification preferences | No columns — **and no SMS code exists at all**. `africastalking` is a dependency but the repository contains no send path, so a toggle would be saved and then respected by nothing |
| Account deletion / deactivation | No columns, and deletion conflicts with retaining contribution and loan records |

These are omitted from the UI rather than shown as inert controls. Listing them
as disabled switches would be exactly the fake-control problem the brief
forbids.

## What the data model does support

- `User`: `id`, `phone`, `name`, `nationalId`, `preferredLocale`, `createdAt`
- `Membership`: `role` (LEADER/SECRETARY/MEMBER), `joinedAt`, group relation
- Money, in integer cents: `Contribution`, `Loan`, `LoanPayment`,
  `ShareOutAllocation`, `MeetingAttendance.fineAmount`
- Existing helpers to reuse: `calculateMemberBalance`, `calculateAmountOwed`,
  `calculateBorrowingLimit`, `formatRWF`, `normalizeRwandanPhone`

## Architecture

URL sub-routes under a shared layout, following the existing `group-tabs.tsx`
pattern (`TabsTrigger asChild` + `Link`, active segment derived from
`usePathname()`).

```
app/dashboard/profile/
  layout.tsx            profile header + section nav, rendered once
  profile-nav.tsx       client nav
  page.tsx              Overview + Personal Information
  personal-info-form.tsx
  actions.ts            updateProfile, changePin
  ibimina/page.tsx      memberships
  activity/page.tsx     financial ledger
  activity/activity-filters.tsx
  security/page.tsx
  security/change-pin-form.tsx
  */loading.tsx         per-section skeletons
app/api/profile/statement/route.ts   CSV export
lib/profile.ts          server-only data layer
```

Each section fetches only its own data. Financial Activity is the expensive
query — merging five tables — so it must not load when someone is reading their
name. The header lives in the layout and is not refetched per section.

Filters are `searchParams`, so filtering happens on the server with no client
state and a filtered view is shareable.

## Sections

### Header (layout)

One bordered panel, roughly 140px on desktop: avatar initials, name in
Fraunces, formatted phone, then a right-aligned `<dl>` of member ID
(`id.slice(-6)`, uppercased, monospace), member-since date, and a status line
showing membership count. Stacks on mobile. Borders, type weight and the
existing `shadow-warm-sm` carry it — no gradients, no decorative shapes.

### Overview + Personal Information (`page.tsx`)

Identity as a semantic `<dl>`. Editable: `name`, preferred language.
Read-only: `phone` (formatted `+250 788 123 456`), `nationalId` (masked to the
last 4), each with a line explaining that changes go through a group leader.

Rationale for read-only: `phone` is the login credential, so a typo locks a
member out of their own savings with no email recovery path; `nationalId` is
identity data a leader should verify.

Language writes to **both** `User.preferredLocale` and the `NEXT_LOCALE`
cookie, preserving today's mobile-only language switcher behaviour.

Form behaviour: Save disabled until dirty, pending state on the button,
`beforeunload` guard while dirty, toast on success and failure.

### My Ibimina (`ibimina/page.tsx`)

Dense rows rather than a card grid: group name, role badge, joined date, member
count, cycle number. Row links to that group's dashboard. Empty state reuses
`PiggyBankIllustration`.

Authorization: queries are scoped by `userId`, so only the caller's own
memberships are reachable.

### Financial Activity (`activity/page.tsx`)

Four stat tiles: total contributions, outstanding loan balance, total repaid,
distributions received.

Then a unified ledger merging, all scoped to the user's memberships:

| Source | Category | Direction |
| --- | --- | --- |
| `Contribution` | contribution | out (member pays in) |
| `Loan` where `takenAt` set | loan disbursement | in |
| `LoanPayment` | repayment | out |
| `ShareOutAllocation` where `status = PAID` | distribution | in |
| `MeetingAttendance` where `fineAmount > 0` | fine | out |

Each entry: date, category, group name, amount, direction, status. Sorted by
date descending, merged in application code since they are separate tables.

Filters via `searchParams`: period (3/12 months, all), category, group.

**Zero versus unavailable:** a member with no contributions shows `0 RWF`
because the query returned a real zero. A figure that cannot be computed shows
`—`. These must not look alike.

Export: `GET /api/profile/statement` streams CSV built from the same ledger
function, respecting the same filters. No new dependency.

### Security (`security/page.tsx`)

Change PIN: current PIN, new PIN, confirmation. The server action re-verifies
the current PIN against `pinHash` with bcrypt before writing — possession of a
session is not sufficient to change the credential. New PIN must differ from
the old one. Plus sign out.

Nothing else appears here, because nothing else has a backend.

## Validation and authorization

- Zod schemas in `lib/schemas.ts`, following the existing
  `createXSchema(t)` translator-injection convention, used by both the client
  form resolver and the server action.
- Every server action calls `auth()` and operates on `session.user.id`. No
  action accepts a user id from the client, so one member cannot act on
  another's record.
- Every read is filtered by `userId` or by `membership: { userId }`.
- Database failures reuse the existing `isDatabaseUnreachable` path and show
  the existing `databaseUnreachable` message.
- `useTransition` plus a disabled submit button prevents duplicate submits.

## i18n

New `profile` namespace in `messages/{en,rw,fr}.json`. Kinyarwanda is the
default locale, so it must be complete, not an English fallback. Dates via
`Intl.DateTimeFormat(locale)`; money via the existing `formatRWF`.

## Testing

- Unit tests for the pure logic: ledger merge ordering, period filtering,
  financial totals, phone display formatting, national-ID masking.
- `npx vitest run`, `npx tsc --noEmit`, `npx eslint`, `npm run build`.
- Manual exercise of every interaction against a **local** throwaway Postgres
  via `.env.local`. Production is never written to during development.
- Responsive check at 390 / 768 / 1280 / 1920 for horizontal overflow.
- Unauthenticated access to each route must redirect to `/login`.

## Out of scope

Everything in the omissions table. Each needs backend infrastructure first:
notification delivery needs an SMS send path and a scheduler; sessions and
device management need a database session strategy; 2FA needs enrolment
storage.
