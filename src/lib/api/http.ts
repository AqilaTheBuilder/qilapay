/**
 * HTTP adapter skeleton. Implements QilaApi over fetch for the real backend.
 * NOT wired until NEXT_PUBLIC_QILA_API_URL is set (see config.ts).
 *
 * Backend contract lives in architecture.md. Endpoint paths below are the
 * proposal; keep them in sync with that doc. Auth headers follow the
 * backend's choice (cookie session or Bearer). Search TODO(backend).
 */

import { API_BASE_URL } from "./config";
import type {
  Quote,
  QuoteRequest,
  Session,
  Transfer,
  TransferRequest,
  UserAccount,
} from "./types";
import type { QilaApi } from "./index";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      (body as { message?: string }).message ??
      `Request failed with status ${response.status}.`;
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}

export class HttpQilaApi implements QilaApi {
  async getSession(): Promise<Session | null> {
    // TODO(backend): GET /api/auth/session -> Session | null (or 401)
    return request<Session | null>("/api/auth/session");
  }

  async login(email: string): Promise<Session> {
    // TODO(backend): POST /api/auth/login { email, password }
    void email;
    return request<Session>("/api/auth/login", { method: "POST" });
  }

  async register(name: string, email: string): Promise<Session> {
    // TODO(backend): POST /api/auth/register { name, email, password }
    void name;
    void email;
    return request<Session>("/api/auth/register", { method: "POST" });
  }

  async logout(): Promise<void> {
    // TODO(backend): POST /api/auth/logout
    await request<void>("/api/auth/logout", { method: "POST" });
  }

  async getAccount(): Promise<UserAccount | null> {
    // TODO(backend): GET /api/account -> UserAccount (tier, limits, balances)
    return request<UserAccount | null>("/api/account");
  }

  async getQuote(quoteRequest: QuoteRequest): Promise<Quote> {
    // TODO(backend): POST /api/quotes { amount, fromCurrency, toCurrency,
    //   recipientName, payoutMethod } -> Quote (rate, fees, allowed, limitReason)
    return request<Quote>("/api/quotes", {
      method: "POST",
      body: JSON.stringify(quoteRequest),
    });
  }

  async createTransfer(transferRequest: TransferRequest): Promise<Transfer> {
    // TODO(backend): POST /api/transfers { ...TransferRequest, quoteId? }
    //   -> Transfer. Backend re-checks tier limits (risk engine) and may
    //   return 422 with { message } when blocked.
    return request<Transfer>("/api/transfers", {
      method: "POST",
      body: JSON.stringify(transferRequest),
    });
  }

  async listTransfers(): Promise<Transfer[]> {
    // TODO(backend): GET /api/transfers -> Transfer[]
    return request<Transfer[]>("/api/transfers");
  }

  async getTransfer(id: string): Promise<Transfer | null> {
    // TODO(backend): GET /api/transfers/:id -> Transfer
    return request<Transfer | null>(
      `/api/transfers/${encodeURIComponent(id)}`,
    );
  }

  async submitVerification(): Promise<UserAccount | null> {
    // TODO(backend): POST /api/kyc/submit -> UserAccount (tier upgraded
    //   after review, or immediately in sandbox)
    return request<UserAccount | null>("/api/kyc/submit", { method: "POST" });
  }
}
