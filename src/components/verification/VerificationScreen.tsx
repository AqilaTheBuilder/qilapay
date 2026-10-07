"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/risk/TierBadge";
import { getApi, type UserAccount } from "@/lib/api";
import { formatUsdShort } from "@/lib/format";
import { TIER_LIMITS } from "@/lib/risk/tiers";
import { ROUTES } from "@/lib/site";

const ROWS: Array<{ label: string; key: "perTransaction" | "daily" | "balance" }> = [
  { label: "Per transfer cap", key: "perTransaction" },
  { label: "Daily cap", key: "daily" },
  { label: "Balance cap", key: "balance" },
];

/**
 * Verification screen. Compares tiers and upgrades the mock account.
 * Backend swap: submitVerification hits POST /api/kyc/submit.
 */
export function VerificationScreen() {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleVerify() {
    setSubmitting(true);
    try {
      const next = await getApi().submitVerification();
      if (next) setAccount(next);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-muted">Loading verification…</p>;
  }

  if (!account) {
    return (
      <Card className="mx-auto mt-10 max-w-[480px] text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Sign in first</h1>
        <p className="mt-2 text-muted">Verification needs a session.</p>
        <Button href={ROUTES.login} size="lg" className="mt-5">
          Go to login →
        </Button>
      </Card>
    );
  }

  const verified = account.tier === "verified";

  return (
    <div className="mx-auto grid max-w-[720px] gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Verification</h1>
        <TierBadge tier={account.tier} />
      </div>

      <Card>
        <div className="grid grid-cols-3 gap-2 text-sm font-bold">
          <span />
          <span className="rounded-full bg-background px-3 py-1 text-center">Unverified</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-center text-emerald-800">
            Verified
          </span>
          {ROWS.map((row) => (
            <div key={row.key} className="contents">
              <span className="py-2 font-semibold text-muted">{row.label}</span>
              <span className="py-2 text-center font-extrabold">
                {formatUsdShort(TIER_LIMITS.unverified[row.key])}
              </span>
              <span className="py-2 text-center font-extrabold">
                {formatUsdShort(TIER_LIMITS.verified[row.key])}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        {verified ? (
          <>
            <h2 className="text-lg font-extrabold tracking-tight">You are verified ✓</h2>
            <p className="mt-1 text-muted">
              Higher caps apply. The risk engine still reviews unusual activity.
            </p>
            <Button href={ROUTES.send} size="lg" className="mt-4">
              Send money →
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-extrabold tracking-tight">Raise your caps</h2>
            <p className="mt-1 text-muted">
              Demo flow: one tap simulates document review. The backend will
              replace this with real KYC later.
            </p>
            <Button size="lg" className="mt-4" onClick={handleVerify} disabled={submitting}>
              {submitting ? "Submitting…" : "Verify my account"}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
