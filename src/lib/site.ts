/**
 * Single source of truth for public routes.
 * Frontend rule: never hardcode href strings in components. Import ROUTES.
 */
export const ROUTES = {
  home: "/",
  features: "/#features",
  control: "/#control",
  automation: "/#automation",
  howItWorks: "/#how-it-works",
  howItWorksPage: "/how-it-works",
  login: "/login",
  signup: "/login?mode=signup",
  register: "/register",
  dashboard: "/dashboard",
  send: "/send",
  transactions: "/transactions",
  wallet: "/wallet",
  verification: "/verification",
} as const;

export type RouteKey = keyof typeof ROUTES;

/** Header navigation. Rendered on desktop and mobile. Keep short. */
export const HEADER_NAV = [
  { label: "Why QilaPay", href: ROUTES.features },
  { label: "You hold it", href: ROUTES.control },
  { label: "AutoTransfer", href: ROUTES.automation },
  { label: "How it works", href: ROUTES.howItWorks },
] as const;

/** App navigation (signed-in shell). Labels double as the page titles. */
export const APP_NAV = [
  { label: "Dashboard", href: ROUTES.dashboard },
  { label: "Send", href: ROUTES.send },
  { label: "Transactions", href: ROUTES.transactions },
  { label: "Wallet", href: ROUTES.wallet },
  { label: "Verification", href: ROUTES.verification },
] as const;

export const SITE = {
  name: "QilaPay",
  tagline: "Send money home. Keep control of it.",
  description:
    "QilaPay is the non-custodial remittance router with lower fees, transparent quotes, AutoTransfer schedules, and funds only you control.",
  year: 2026,
  supportEmail: "support@qilapay.example",
} as const;
