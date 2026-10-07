/**
 * Deterministic quote math used by the MOCK adapter so the demo is stable.
 * The real backend owns this formula in production. It is kept here (not in
 * the mock file) so guides.md can point the backend dev at one function to
 * mirror, and so validation and the wizard share the same fee constants.
 */

import type { Currency, KycTier, Quote, QuoteRequest } from "./types";
import { checkAmount } from "@/lib/risk/tiers";

/** Static FX table for the demo. Backend replaces with live rates. */
const RATES: Record<string, Partial<Record<Currency, number>>> = {
  USD: { PHP: 56.8, IDR: 15820, VND: 25400, EUR: 0.92 },
  EUR: { PHP: 61.4, IDR: 17100, VND: 27450, USD: 1.09 },
};

export const QUOTE_CONSTANTS = {
  networkFee: 1.2,
  serviceFeeRate: 0.008,
  minServiceFee: 1,
  eta: "5-15 minutes",
} as const;

export function getMockRate(from: Currency, to: Currency): number {
  return RATES[from]?.[to] ?? 1;
}

/**
 * Build a quote preview from a request plus the caller's tier context.
 * Pure function: easy to unit test, no I/O.
 */
export function buildQuotePreview(
  request: QuoteRequest,
  context: { tier: KycTier; dailyUsed: number },
): Quote {
  const rate = getMockRate(request.fromCurrency, request.toCurrency);
  const networkFee = QUOTE_CONSTANTS.networkFee;
  const serviceFee = Math.max(
    QUOTE_CONSTANTS.minServiceFee,
    request.amount * QUOTE_CONSTANTS.serviceFeeRate,
  );
  const totalFee = networkFee + serviceFee;
  const receiveAmount = Math.max(0, request.amount - totalFee) * rate;
  const verdict = checkAmount(request.amount, context.tier, context.dailyUsed);

  return {
    ...request,
    rate,
    networkFee,
    serviceFee,
    totalFee,
    receiveAmount,
    eta: QUOTE_CONSTANTS.eta,
    allowed: verdict.allowed,
    limitReason: verdict.reason,
  };
}
