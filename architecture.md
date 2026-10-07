# QilaPay Frontend Architecture

> One rule: screens talk to `QilaApi` and nothing else. The backend swap is
> an env var, not a rewrite. Details for flipping are in `guides.md`.

## 1. Principles

- **One contract.** `src/lib/api/types.ts` is the shared language with the
  backend. Change shapes there first.
- **One doorway.** UI imports `getApi()` from `src/lib/api/index.ts`. Never
  import `mock.ts` or `http.ts` directly.
- **Pure logic stays pure.** Tier math (`lib/risk`), validators
  (`lib/validation`), and formatters (`lib/format`) have no React and no I/O,
  so they are trivial to test and to mirror server-side.
- **Reuse before invent.** Buttons, cards, badges, and form fields live in
  `components/ui`. Feature components compose them.

## 2. Route map

Public (pre-login) pages use the marketing header and footer:

| Route           | File                        | Purpose                                  |
| --------------- | --------------------------- | ---------------------------------------- |
| `/`             | `app/page.tsx`              | Landing: hero, features, control, AutoTransfer, steps, CTA |
| `/login`        | `app/login/page.tsx`        | Login (also `?mode=signup`)              |
| `/register`     | `app/register/page.tsx`     | Signup, shares `LoginForm`               |
| `/how-it-works` | `app/how-it-works/page.tsx` | Standalone explainer                     |

Signed-in pages live in the `(app)` route group (group adds no URL prefix).
The floating header capsule is session-aware: signed out it shows marketing
links, signed in it shows the app tabs, so app pages never show marketing
links. The footer hides itself for signed-in users for the same reason.

| Route               | Screen                                          | Purpose                                  |
| ------------------- | ----------------------------------------------- | ---------------------------------------- |
| `/dashboard`        | `components/dashboard/DashboardScreen.tsx`      | Greeting, balances, limits, recent list  |
| `/send`             | `components/send/SendScreen.tsx` + `SendWizard` | 4-step transfer flow                     |
| `/transactions`     | `components/transaction/TransactionsScreen.tsx` | Full history with status filter          |
| `/transactions/[id]`| `components/transaction/TransactionDetailScreen.tsx` | Receipt detail                      |
| `/wallet`           | `components/wallet/WalletScreen.tsx`            | Balances, limits, receive address        |
| `/verification`     | `components/verification/VerificationScreen.tsx`| Tier comparison plus mock KYC upgrade    |

Each route file is a thin server wrapper (metadata) that renders one client
screen. Screens own loading, error, and signed-out states.

## 3. Component map

```
components/
  ui/            Button, Card, Eyebrow, SectionHeading, FormField (+inputStyles),
                 StatusBadge            <- generic pills and form chrome
  layout/        SiteHeader (session-aware floating capsule nav),
                 SiteFooter (pre-login only, hidden when signed in)
  auth/          LoginForm              <- sign-in via QilaApi, redirects to /dashboard
  risk/          TierBadge, LimitNotice  <- tier pill, blocked-amount explainer
  wallet/        BalanceCard, LimitsCard, WalletScreen
  transaction/   TransferList (+item), TransferReceipt, TransactionsScreen,
                 TransactionDetailScreen
  send/          SendWizard (orchestrator), RecipientStep, AmountStep,
                 ReviewStep, SuccessStep, SendScreen
  dashboard/     DashboardScreen
  landing/       pre-login sections (unchanged)
```

`TransferReceipt` is used by both the send success step and the receipt page
so they can never drift apart. `BalanceCard` and `LimitsCard` are shared by
dashboard and wallet for the same reason.

## 4. Data layer (plug-and-play)

```
Screen / component
  -> getApi()                      (src/lib/api/index.ts, singleton factory)
    -> MockQilaApi  (mock.ts)       while NEXT_PUBLIC_QILA_API_URL is empty
    -> HttpQilaApi  (http.ts)       once the env var is set
```

Interface (`QilaApi`): `getSession`, `login`, `register`, `logout`,
`getAccount`, `getQuote`, `createTransfer`, `listTransfers`, `getTransfer`,
`submitVerification`. All async, all typed in `types.ts`.

- **Mock** persists session, account, and transfers in `localStorage`
  (keys in `config.ts`). Quote math lives in `api/quote.ts`
  (`buildQuotePreview`) so the formula is documented in one place for the
  backend to mirror. New transfers start `Processing` and flip to
  `Completed` after ~4s to demo both badge states. Daily usage resets when
  the calendar day changes.
- **HTTP** is a skeleton: each method maps to one endpoint and carries a
  `TODO(backend)` note. Bodies already match `types.ts`.

## 5. Tier and risk model

Maps to the account-tier diagram: `USER -> KYC Tier -> UNVERIFIED
(restricted: per-tx, daily, balance caps) vs VERIFIED (higher tier) ->
Risk Engine`.

- Caps live in `TIER_LIMITS` (`src/lib/risk/tiers.ts`). Edit that one object
  to change limits for the year.
- `checkAmount(amount, tier, dailyUsed)` is the shared verdict used by the
  AmountStep validator, the quote builder, and the review gate. The backend
  re-checks on `POST /api/transfers` and returns `422 { message }` when the
  risk engine blocks.
- `LimitNotice` renders the verdict reason plus a link to `/verification`.

## 6. Backend contract

Base URL: `NEXT_PUBLIC_QILA_API_URL`. Auth: cookie session (`credentials:
"include"` is already set) or Bearer, backend's choice. Errors: non-2xx
with JSON `{ message: string }`.

| Method | Path                  | Body / params                                      | Returns                                  |
| ------ | --------------------- | -------------------------------------------------- | ---------------------------------------- |
| GET    | `/api/auth/session`   | —                                                  | `Session \| null` (or 401)               |
| POST   | `/api/auth/login`     | `{ email, password }`                              | `Session`                                |
| POST   | `/api/auth/register`  | `{ name, email, password }`                        | `Session`                                |
| POST   | `/api/auth/logout`    | —                                                  | `204`                                    |
| GET    | `/api/account`        | —                                                  | `UserAccount` (tier, limits, balances)   |
| POST   | `/api/quotes`         | `QuoteRequest`                                     | `Quote` (rate, fees, allowed, limitReason) |
| POST   | `/api/transfers`      | `TransferRequest` (plus `quoteId` if quoted)       | `Transfer`                               |
| GET    | `/api/transfers`      | —                                                  | `Transfer[]`                             |
| GET    | `/api/transfers/:id`  | —                                                  | `Transfer`                               |
| POST   | `/api/kyc/submit`     | backend-defined document payload                   | `UserAccount` (new tier)                 |

Field shapes are the TypeScript types in `src/lib/api/types.ts`. Treat that
file as the IDL: backend structs should match it 1:1.

## 7. State strategy

- **Server:** route files export `metadata` and render screens. No data
  fetching in route files yet; screens fetch client-side so the mock
  (localStorage) works today. When the backend lands, screens can stay as-is
  (HTTP adapter is async over network) or move to server fetches gradually.
- **Client:** wizard draft lives in `SendWizard` state. Screens use
  `useState` + `useEffect` + `getApi()`. No global store: nothing yet needs
  cross-page shared state beyond the account, which each screen loads.
- **Guard:** screens show a "Sign in first" card when `getAccount()` is null.
  This moves to middleware + cookie check with the real backend (see
  guides.md).

## 8. Deliberately not built (yet)

- `receive/` and `settings/` routes. Receive lives as a block inside
  `/wallet` until deposit flows exist. Settings waits until there is
  something to set.
- `send/recipient|amount|review|success` sub-routes. The wizard is one page
  with step state; split it when deep-linking or per-step analytics is
  needed (lift wizard state into a context, one route per step).
- `(auth)` route group. `/login` + `/register` share `LoginForm` today;
  regroup when auth UI grows.
- Real-time status (polling/websockets). The mock flips `Processing` to
  `Completed` locally; the backend version re-fetches on focus or polls
  `GET /api/transfers/:id`.
