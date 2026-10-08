"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { LimitsCard } from "@/components/wallet/LimitsCard";
import { shortenAddress } from "@/lib/format";
import { getApi, type UserAccount } from "@/lib/api";
import { ROUTES } from "@/lib/site";

/**
 * Wallet screen. Balances plus the receive address block.
 * Receive lives here (not a separate route) until deposit flows exist.
 */
export function WalletScreen() {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getApi()
      .getAccount()
      .then((next) => {
        if (!cancelled) {
          setAccount(next);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="py-16 text-center text-muted">Loading wallet…</p>;
  }

  if (!account) {
    return (
      <Card className="mx-auto mt-10 max-w-120 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Sign in first</h1>
        <p className="mt-2 text-muted">The wallet needs a session.</p>
        <Button href={ROUTES.login} size="lg" className="mt-5">
          Go to login →
        </Button>
      </Card>
    );
  }

  async function handleCopy() {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-muted">Self-custody</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Wallet</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BalanceCard account={account} />
        <LimitsCard account={account} />
      </div>

      <Card>
        <h2 className="text-lg font-extrabold tracking-tight">Receive</h2>
        <p className="mt-1 text-muted">
          Share this address to receive funds. They stay in your wallet until
          you send.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-background px-4 py-3">
          <code className="break-all font-bold">{shortenAddress(account.walletAddress)}</code>
          <Button variant="secondary" onClick={handleCopy} className="ml-auto">
            {copied ? "Copied ✓" : "Copy"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
