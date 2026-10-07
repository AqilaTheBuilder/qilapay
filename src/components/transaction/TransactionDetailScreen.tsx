"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { TransferReceipt } from "@/components/transaction/TransferReceipt";
import { getApi, type Transfer } from "@/lib/api";
import { ROUTES } from "@/lib/site";

/** Receipt detail. Same receipt component as the success step. */
export function TransactionDetailScreen({ id }: { id: string }) {
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getApi()
      .getTransfer(id)
      .then((found) => {
        if (!cancelled) {
          setTransfer(found);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="py-16 text-center text-muted">Loading receipt…</p>;
  }

  if (!transfer) {
    return (
      <div className="mx-auto mt-10 max-w-[480px] text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Not found</h1>
        <p className="mt-2 text-muted">No transfer with ID {id}.</p>
        <Button href={ROUTES.transactions} variant="secondary" size="lg" className="mt-5">
          ← Back to history
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[640px] gap-4">
      <Link href={ROUTES.transactions} className="text-sm font-bold text-muted hover:text-ink">
        ← All transactions
      </Link>
      <TransferReceipt transfer={transfer} />
    </div>
  );
}
