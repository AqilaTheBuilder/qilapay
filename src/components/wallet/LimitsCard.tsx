import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/risk/TierBadge";
import { formatUsdShort } from "@/lib/format";
import { remainingDaily } from "@/lib/risk/tiers";
import { ROUTES } from "@/lib/site";
import type { UserAccount } from "@/lib/api/types";

/**
 * Tier plus daily-limit meter. Shared by dashboard and wallet so the
 * numbers can never disagree between pages.
 */
export function LimitsCard({ account }: { account: UserAccount }) {
  const left = remainingDaily(account.tier, account.dailyUsed);
  const usedPct = Math.min(
    100,
    Math.round((account.dailyUsed / account.limits.daily) * 100),
  );

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight">Limits</h2>
        <TierBadge tier={account.tier} />
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-muted">Daily usage</span>
          <strong>
            {formatUsdShort(account.dailyUsed)} of{" "}
            {formatUsdShort(account.limits.daily)}
          </strong>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-background"
          role="progressbar"
          aria-valuenow={usedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Daily limit usage"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted">
          {formatUsdShort(left)} left today. Per transfer cap{" "}
          {formatUsdShort(account.limits.perTransaction)}.
        </p>
      </div>

      {account.tier === "unverified" ? (
        <Link
          href={ROUTES.verification}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-night px-4.5 text-[15px] font-bold text-white"
        >
          Verify to raise limits →
        </Link>
      ) : null}
    </Card>
  );
}
