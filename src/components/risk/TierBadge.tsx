import { StatusBadge } from "@/components/ui/StatusBadge";
import type { KycTier } from "@/lib/api/types";

/**
 * Tier pill shown on dashboard, wallet, and verification pages.
 * Verified reads as success, unverified as pending action.
 */
export function TierBadge({ tier }: { tier: KycTier }) {
  return tier === "verified" ? (
    <StatusBadge tone="success">Verified</StatusBadge>
  ) : (
    <StatusBadge tone="pending">Unverified</StatusBadge>
  );
}
