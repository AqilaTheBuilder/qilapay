/**
 * QilaApi: the ONLY thing screens and components call for data.
 * Plug-and-play rule: UI never imports mock.ts or http.ts directly.
 * The backend swap is flipping NEXT_PUBLIC_QILA_API_URL (see config.ts).
 */

import { USE_MOCK_API } from "./config";
import { HttpQilaApi } from "./http";
import { MockQilaApi } from "./mock";
import type {
  Quote,
  QuoteRequest,
  Session,
  Transfer,
  TransferRequest,
  UserAccount,
} from "./types";

export type QilaApi = {
  getSession(): Promise<Session | null>;
  login(email: string): Promise<Session>;
  register(name: string, email: string): Promise<Session>;
  logout(): Promise<void>;
  getAccount(): Promise<UserAccount | null>;
  getQuote(request: QuoteRequest): Promise<Quote>;
  createTransfer(request: TransferRequest): Promise<Transfer>;
  listTransfers(): Promise<Transfer[]>;
  getTransfer(id: string): Promise<Transfer | null>;
  submitVerification(): Promise<UserAccount | null>;
};

let instance: QilaApi | null = null;

/** Singleton factory. Everything UI-side calls this. */
export function getApi(): QilaApi {
  if (!instance) {
    instance = USE_MOCK_API ? new MockQilaApi() : new HttpQilaApi();
  }
  return instance;
}

/** True while running on demo data. Screens show a small badge when true. */
export function isMockApi(): boolean {
  return USE_MOCK_API;
}

export type {
  KycTier,
  PayoutMethod,
  Currency,
  Quote,
  QuoteRequest,
  Session,
  TierLimits,
  Transfer,
  TransferRequest,
  TransferStatus,
  UserAccount,
} from "./types";
