/**
 * Send-flow validators. Pure functions shared by every wizard step.
 * No React, no API calls. The backend repeats these checks server-side;
 * the frontend runs them first for instant feedback.
 */

import { checkAmount } from "@/lib/risk/tiers";
import type { KycTier, PayoutMethod } from "@/lib/api/types";

export const PAYOUT_METHODS: PayoutMethod[] = [
  "Bank transfer",
  "Cash pickup",
  "Mobile money",
];

export const AMOUNT_CURRENCIES = ["USD", "EUR"] as const;
export const RECEIVE_CURRENCIES = ["IDR", "PHP", "VND", "EUR", "USD"] as const;

export type FieldErrors = Record<string, string | undefined>;

export type RecipientDraft = {
  recipientName: string;
  payoutMethod: PayoutMethod;
};

export type AmountDraft = {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
};

/** Step 1: recipient name non-empty, payout method known. */
export function validateRecipient(draft: RecipientDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (draft.recipientName.trim().length < 2) {
    errors.recipientName = "Enter the recipient's full name.";
  }
  if (!PAYOUT_METHODS.includes(draft.payoutMethod)) {
    errors.payoutMethod = "Choose a payout method.";
  }
  return errors;
}

/**
 * Step 2: amount parses, is positive, differs in currency, and passes
 * the tier risk check. Needs tier context so the message matches limits.
 */
export function validateAmount(
  draft: AmountDraft,
  context: { tier: KycTier; dailyUsed: number },
): FieldErrors {
  const errors: FieldErrors = {};
  const amount = Number(draft.amount);

  if (draft.amount.trim() === "" || !Number.isFinite(amount)) {
    errors.amount = "Enter a numeric amount.";
    return errors;
  }
  if (draft.fromCurrency === draft.toCurrency) {
    errors.toCurrency = "Destination must differ from source currency.";
  }
  const verdict = checkAmount(amount, context.tier, context.dailyUsed);
  if (!verdict.allowed && verdict.reason) {
    errors.amount = verdict.reason;
  }
  return errors;
}

/** True when an errors map has no messages. */
export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined);
}
