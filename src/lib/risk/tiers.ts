/**
 * Tier limits and risk checks. Pure functions, no React, no I/O.
 * The frontend gates with these AND the backend enforces them. Both read
 * the same numbers here so the demo never promises what the API rejects.
 *
 * To change limits for the year, edit TIER_LIMITS only.
 */

import type { KycTier, TierLimits } from "@/lib/api/types";

/** Caps in USD. Mirrors the account-tier diagram (restricted vs higher tier). */
export const TIER_LIMITS: Record<KycTier, TierLimits> = {
  unverified: { perTransaction: 1000, daily: 2500, balance: 5000 },
  verified: { perTransaction: 10000, daily: 2500 * 10, balance: 100000 },
};

export type LimitVerdict = {
  allowed: boolean;
  /** Human reason shown in LimitNotice. Null when allowed. */
  reason: string | null;
};

export function getLimits(tier: KycTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Risk check for one amount at the caller's tier and daily usage.
 * Order matters: per-transaction first (clearest message), then daily.
 */
export function checkAmount(
  amount: number,
  tier: KycTier,
  dailyUsed: number,
): LimitVerdict {
  const limits = getLimits(tier);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { allowed: false, reason: "Enter an amount greater than zero." };
  }
  if (amount > limits.perTransaction) {
    return {
      allowed: false,
      reason: `Exceeds your per-transfer cap of $${limits.perTransaction.toLocaleString()} on the ${tier} tier. Verify to raise it.`,
    };
  }
  if (dailyUsed + amount > limits.daily) {
    const left = Math.max(0, limits.daily - dailyUsed);
    return {
      allowed: false,
      reason: `Only $${left.toLocaleString()} left of today's $${limits.daily.toLocaleString()} limit. Verify or wait for reset.`,
    };
  }
  return { allowed: true, reason: null };
}

/** Dollars left today. Used by the limit meter. */
export function remainingDaily(tier: KycTier, dailyUsed: number): number {
  return Math.max(0, getLimits(tier).daily - dailyUsed);
}
