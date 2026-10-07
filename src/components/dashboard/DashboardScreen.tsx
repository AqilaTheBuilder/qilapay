"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/risk/TierBadge";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { LimitsCard } from "@/components/wallet/LimitsCard";
import { TransferList } from "@/components/transaction/TransferList";
import { getApi, type Transfer, type UserAccount } from "@/lib/api";
import { ROUTES } from "@/lib/site";

/**
 * Dashboard screen. Loads account plus recent transfers through QilaApi,
 * so the backend swap needs zero changes here.
 */
export function DashboardScreen() {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const api = getApi();
      const nextAccount = await api.getAccount();
      if (cancelled) return;
      if (!nextAccount) {
        setSignedOut(true);
        setLoading(false);
        return;
      }
      setAccount(nextAccount);
      setTransfers(await api.listTransfers());
      if (!cancelled) setLoading(false);
    }
    load().catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="py-16 text-center text-muted">Loading dashboard…</p>;
  }

  if (signedOut || !account) {
    return (
      <Card className="mx-auto mt-10 max-w-[480px] text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Sign in first</h1>
        <p className="mt-2 text-muted">
          The dashboard needs a session. Use any email on the demo login.
        </p>
        <Button href={ROUTES.login} size="lg" className="mt-5">
          Go to login →
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">Welcome back,</p>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
            {account.name} <TierBadge tier={account.tier} />
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={ROUTES.send} size="lg">
            Send money →
          </Button>
          <Button href={ROUTES.transactions} variant="secondary" size="lg">
            History
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BalanceCard account={account} />
        <LimitsCard account={account} />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">Recent transfers</h2>
          <Link href={ROUTES.transactions} className="text-sm font-bold text-primary-dark">
            View all →
          </Link>
        </div>
        <TransferList transfers={transfers.slice(0, 4)} />
      </Card>
    </div>
  );
}
