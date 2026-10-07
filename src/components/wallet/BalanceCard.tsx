import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/format";
import type { UserAccount } from "@/lib/api/types";

/**
 * Non-custodial balance card. Lists each currency balance.
 * Backend swap: balances arrive from GET /api/account, same shape.
 */
export function BalanceCard({ account }: { account: UserAccount }) {
  const primary = account.balances[0];
  return (
    <Card>
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        Total balance
      </p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight">
        {primary ? formatMoney(primary.amount, primary.currency) : "$0.00"}
      </p>
      <ul className="mt-4 grid gap-2">
        {account.balances.map((balance) => (
          <li
            key={balance.currency}
            className="flex items-center justify-between rounded-2xl bg-background px-4 py-2.5 text-sm"
          >
            <span className="font-bold text-muted">{balance.currency}</span>
            <strong>{formatMoney(balance.amount, balance.currency)}</strong>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted">
        Self-custody. QilaPay never holds these funds.
      </p>
    </Card>
  );
}
