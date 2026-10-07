# QilaPay Frontend Guides

Practical recipes for the year. Architecture rationale lives in
`architecture.md`. This file is commands and steps.

## 1. Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build
```

No env vars needed for demo: with `NEXT_PUBLIC_QILA_API_URL` unset, the app
runs on the mock adapter (localStorage demo data, see §2).

## 2. Mock data vs real backend

**Today (mock):** `getApi()` returns `MockQilaApi`. Demo login accepts any
email. Data persists in `localStorage` under keys in `src/lib/api/config.ts`
(`qila_session`, `qila_account`, `qila_transfers`, `qila_day`). A "Demo data"
badge shows in the header capsule. Clear site data in devtools to reset.

**Flip to backend (5 steps):**

1. Backend implements the endpoint table in `architecture.md` §6, matching
   `src/lib/api/types.ts` field-for-field.
2. Set `NEXT_PUBLIC_QILA_API_URL=https://<backend-origin>` in `.env.local`.
3. Restart `npm run dev`. `getApi()` now returns `HttpQilaApi`.
4. Remove the `isMockApi()` demo badge in `SiteHeader` (one block).
5. Move the signed-out guard to middleware (cookie check, redirect to
   `/login`). Delete `mock.ts` only when no screen references localStorage
   behavior anymore (nothing imports it directly, so this is safe).

## 3. Add a new API method (example: cancel a transfer)

1. Add types to `src/lib/api/types.ts` first (e.g. `CancelResult`).
2. Add the signature to `QilaApi` in `src/lib/api/index.ts`.
3. Implement in `mock.ts` (localStorage behavior + delay).
4. Implement in `http.ts` (one `request()` call + `TODO(backend)` endpoint).
5. Call `getApi().cancelTransfer(...)` from the screen. No other wiring.

## 4. Add a new page (example: `/settings`)

1. Create the screen: `src/components/settings/SettingsScreen.tsx`
   (client component, loads via `getApi()`, handles loading/signed-out).
2. Create the route: `src/app/(app)/settings/page.tsx` that renders it
   (copy `dashboard/page.tsx`, change metadata + import).
3. Add the route to `ROUTES` in `src/lib/site.ts` and a tab in `APP_NAV`.
   Never hardcode hrefs elsewhere.

## 5. Change limits, fees, or copy

- Limits: edit `TIER_LIMITS` in `src/lib/risk/tiers.ts`. UI gates, meters,
  and the verification table update together.
- Quote fees: edit `QUOTE_CONSTANTS` in `src/lib/api/quote.ts` and tell the
  backend dev (they own the production formula).
- Corridors/payout methods: extend `RATES` in `quote.ts` and
  `PAYOUT_METHODS` / currency lists in `src/lib/validation/send.ts`.
- Marketing copy: `components/landing/*` only. App copy lives next to its
  component.

## 6. Auth roadmap

Current: `LoginForm` calls `getApi().login/register`, stores a demo session,
redirects to `/dashboard`. Screens guard with a "Sign in first" card.

With backend: wire `http.ts` auth methods to real endpoints, then add
`middleware.ts` that checks the session cookie and redirects `/dashboard`,
`/send`, `/transactions`, `/wallet`, `/verification` to `/login` when
absent. Screens keep their guards as a fallback.

## 7. Before every PR (checklist)

- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] Manual flows: register → dashboard → send ($50 ok, $5000 blocked as
      unverified) → verify → send again → receipt → history → wallet.
- [ ] No new dependencies (`package.json` unchanged) unless justified in
      the PR description.
- [ ] No hardcoded hrefs (import `ROUTES`), no inline API shapes (import
      `lib/api/types`), no new color tokens (use `globals.css` theme).
- [ ] `architecture.md` updated if routes, endpoints, or tiers changed.

## 8. Troubleshooting

| Symptom                                            | Fix                                                        |
| -------------------------------------------------- | ---------------------------------------------------------- |
| Dashboard says "Sign in first" on every visit      | Log in once; the mock session lives in `localStorage`.     |
| Stale limits after editing `TIER_LIMITS`           | Clear site data; the mock account snapshot stores old caps.|
| Transfer stuck on Processing                       | Wait ~4s (mock finality timer) or reload history.          |
| `getTransfer` returns null for a fresh ID          | IDs only persist in the same browser (localStorage mock).  |
| Build error about `use client` + `metadata`        | Metadata stays in `page.tsx` (server); hooks go in the screen component. |
