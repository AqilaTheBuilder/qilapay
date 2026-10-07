/**
 * Domain types shared by the mock API and the future HTTP API.
 * This file is the contract with the backend. If the backend changes a
 * shape, update it here first, then the mock, then the UI.
 *
 * Rule: pages and components may import from here, but never hardcode
 * these shapes inline. That keeps the backend swap to one file.
 */

/** KYC tier. Drives limits everywhere (see lib/risk/tiers.ts). */
export type KycTier = "unverified" | "verified";

/** Per-tier caps, always expressed in USD for comparison. */
export type TierLimits = {
  perTransaction: number;
  daily: number;
  balance: number;
};

/** Supported payout rails. Keep in sync with the backend enum. */
export type PayoutMethod = "Bank transfer" | "Cash pickup" | "Mobile money";

/** Corridors the demo supports. The backend owns the full list later. */
export type Currency = "USD" | "EUR" | "IDR" | "PHP" | "VND";

/** Minimal session stored after login/register (demo). */
export type Session = {
  name: string;
  email: string;
};

/** Account view shown on dashboard, wallet, and verification pages. */
export type UserAccount = {
  id: string;
  name: string;
  email: string;
  tier: KycTier;
  limits: TierLimits;
  /** USD spent today. Resets daily on the backend; mock resets on new day. */
  dailyUsed: number;
  walletAddress: string;
  balances: Array<{ currency: Currency; amount: number }>;
};

export type QuoteRequest = {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  recipientName: string;
  payoutMethod: PayoutMethod;
};

export type Quote = QuoteRequest & {
  rate: number;
  networkFee: number;
  serviceFee: number;
  totalFee: number;
  receiveAmount: number;
  eta: string;
  /** Risk verdict for this quote at the caller's tier. */
  allowed: boolean;
  limitReason: string | null;
};

export type TransferStatus = "Processing" | "Completed" | "Failed";

export type Transfer = {
  id: string;
  recipient: string;
  payoutMethod: PayoutMethod;
  amount: number;
  currency: Currency;
  receiveAmount: number;
  receiveCurrency: Currency;
  txHash: string;
  status: TransferStatus;
  /** Human date, e.g. "Oct 7, 2026". The backend returns ISO; adapter formats. */
  date: string;
  createdAt: number;
};

/** Payload the wizard sends on confirm. Matches QuoteRequest today. */
export type TransferRequest = QuoteRequest;
