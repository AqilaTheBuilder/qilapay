"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SendWizard } from "@/components/send/SendWizard";
import { getApi, type UserAccount } from "@/lib/api";
import { ROUTES } from "@/lib/site";

/** Send screen. Guards on account (for tier limits), then renders wizard. */
export function SendScreen() {
  const [account, setAccount] = useState<UserAccount | null>(null);
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
    return <p className="py-16 text-center text-muted">Loading send…</p>;
  }

  if (!account) {
    return (
      <Card className="mx-auto mt-10 max-w-[480px] text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Sign in first</h1>
        <p className="mt-2 text-muted">Sending needs a session.</p>
        <Button href={ROUTES.login} size="lg" className="mt-5">
          Go to login →
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-muted">Send money</p>
        <h1 className="text-3xl font-extrabold tracking-tight">
          New transfer
        </h1>
      </div>
      <SendWizard account={account} />
    </div>
  );
}
