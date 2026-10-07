/**
 * Mock adapter. Implements QilaApi with deterministic data in localStorage.
 * Used while NEXT_PUBLIC_QILA_API_URL is empty. Delete nothing when the
 * backend lands: flip the env var and this file goes idle.
 *
 * Storage keys live in config.ts (MOCK_KEYS). All methods are async with a
 * short delay so loading states behave like the real network.
 */

import { MOCK_KEYS } from "./config";
import { buildQuotePreview } from "./quote";
import { getLimits } from "@/lib/risk/tiers";
import type {
  KycTier,
  Quote,
  QuoteRequest,
  Session,
  Transfer,
  TransferRequest,
  TransferStatus,
  UserAccount,
} from "./types";
import type { QilaApi } from "./index";

const LATENCY_MS = 350;
const SEED_DAY = () => new Date().toISOString().slice(0, 10);

function delay() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function seedTransfers(): Transfer[] {
  return [
    {
      id: "QIL-1002",
      recipient: "Maria Santos",
      payoutMethod: "Bank transfer",
      amount: 450,
      currency: "USD",
      receiveAmount: 24900,
      receiveCurrency: "PHP",
      txHash: "0x9f2c41aa7d01",
      status: "Completed",
      date: "Sep 28, 2026",
      createdAt: Date.parse("2026-09-28T10:00:00Z"),
    },
    {
      id: "QIL-1001",
      recipient: "Ayu Lestari",
      payoutMethod: "Mobile money",
      amount: 220,
      currency: "USD",
      receiveAmount: 3420000,
      receiveCurrency: "IDR",
      txHash: "0x51bd90c2e44a",
      status: "Completed",
      date: "Sep 25, 2026",
      createdAt: Date.parse("2026-09-25T10:00:00Z"),
    },
  ];
}

function displayName(email: string): string {
  const base = email.split("@")[0] ?? "Demo User";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function fakeAddress(): string {
  const hex = Math.random().toString(16).slice(2, 6);
  return `0x7f…${hex}Q2a`;
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export class MockQilaApi implements QilaApi {
  async getSession(): Promise<Session | null> {
    return read<Session | null>(MOCK_KEYS.session, null);
  }

  async login(email: string): Promise<Session> {
    await delay();
    const session = { name: displayName(email), email: email.trim() };
    write(MOCK_KEYS.session, session);
    this.ensureAccount(session);
    return session;
  }

  async register(name: string, email: string): Promise<Session> {
    await delay();
    const session = { name: name.trim() || displayName(email), email: email.trim() };
    write(MOCK_KEYS.session, session);
    this.ensureAccount(session);
    return session;
  }

  async logout(): Promise<void> {
    window.localStorage.removeItem(MOCK_KEYS.session);
  }

  async getAccount(): Promise<UserAccount | null> {
    const session = await this.getSession();
    if (!session) return null;
    return this.ensureAccount(session);
  }

  async getQuote(request: QuoteRequest): Promise<Quote> {
    await delay();
    const account = await this.getAccount();
    const tier: KycTier = account?.tier ?? "unverified";
    return buildQuotePreview(request, {
      tier,
      dailyUsed: account?.dailyUsed ?? 0,
    });
  }

  async createTransfer(request: TransferRequest): Promise<Transfer> {
    await delay();
    const account = await this.getAccount();
    if (!account) throw new Error("Not signed in.");
    const quote = buildQuotePreview(request, {
      tier: account.tier,
      dailyUsed: account.dailyUsed,
    });
    if (!quote.allowed) throw new Error(quote.limitReason ?? "Blocked by limits.");

    const transfer: Transfer = {
      id: `QIL-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: request.recipientName,
      payoutMethod: request.payoutMethod,
      amount: request.amount,
      currency: request.fromCurrency,
      receiveAmount: quote.receiveAmount,
      receiveCurrency: request.toCurrency,
      txHash: `0x${Math.random().toString(16).slice(2, 14)}`,
      status: "Processing",
      date: todayLabel(),
      createdAt: Date.now(),
    };

    const transfers = this.readTransfers();
    transfers.unshift(transfer);
    write(MOCK_KEYS.transfers, transfers.slice(0, 25));

    account.dailyUsed += request.amount;
    write(MOCK_KEYS.account, account);

    // Demo finality: flip to Completed shortly after creation.
    window.setTimeout(() => {
      try {
        const list = read<Transfer[]>(MOCK_KEYS.transfers, []);
        const next = list.map((t) =>
          t.id === transfer.id
            ? { ...t, status: "Completed" as TransferStatus }
            : t,
        );
        write(MOCK_KEYS.transfers, next);
      } catch {
        /* storage unavailable, ignore */
      }
    }, 4000);

    return transfer;
  }

  async listTransfers(): Promise<Transfer[]> {
    await delay();
    return this.readTransfers();
  }

  async getTransfer(id: string): Promise<Transfer | null> {
    await delay();
    return this.readTransfers().find((t) => t.id === id) ?? null;
  }

  async submitVerification(): Promise<UserAccount | null> {
    await delay();
    const account = await this.getAccount();
    if (!account) return null;
    const next: UserAccount = {
      ...account,
      tier: "verified",
      limits: getLimits("verified"),
    };
    write(MOCK_KEYS.account, next);
    return next;
  }

  // -- helpers -----------------------------------------------------------

  private ensureAccount(session: Session): UserAccount {
    this.resetDayIfNeeded();
    const existing = read<UserAccount | null>(MOCK_KEYS.account, null);
    if (existing && existing.email === session.email) return existing;
    const fresh: UserAccount = {
      id: `usr-${session.email}`,
      name: session.name,
      email: session.email,
      tier: "unverified",
      limits: getLimits("unverified"),
      dailyUsed: 0,
      walletAddress: fakeAddress(),
      balances: [
        { currency: "USD", amount: 2450 },
        { currency: "IDR", amount: 8200000 },
      ],
    };
    write(MOCK_KEYS.account, fresh);
    return fresh;
  }

  private readTransfers(): Transfer[] {
    const list = read<Transfer[] | null>(MOCK_KEYS.transfers, null);
    if (list) return list;
    const seed = seedTransfers();
    write(MOCK_KEYS.transfers, seed);
    return seed;
  }

  /** Daily usage resets when the calendar day changes. */
  private resetDayIfNeeded() {
    const today = SEED_DAY();
    const stored = read<string | null>(MOCK_KEYS.day, null);
    if (stored === today) return;
    write(MOCK_KEYS.day, today);
    const account = read<UserAccount | null>(MOCK_KEYS.account, null);
    if (account) write(MOCK_KEYS.account, { ...account, dailyUsed: 0 });
  }
}
