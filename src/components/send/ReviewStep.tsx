"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LimitNotice } from "@/components/risk/LimitNotice";
import { formatMoney } from "@/lib/format";
import type { Quote, Transfer } from "@/lib/api/types";

type ReviewStepProps = {
  quote: Quote;
  recipientName: string;
  onBack: () => void;
  onConfirm: () => Promise<Transfer>;
  onDone: (transfer: Transfer) => void;
};

/** Step 3: full quote breakdown plus confirm. Blocks when over limits. */
export function ReviewStep({ quote, recipientName, onBack, onConfirm, onDone }: ReviewStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    try {
      const transfer = await onConfirm();
      onDone(transfer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed.");
    } finally {
      setLoading(false);
    }
  }

  const rows: Array<[string, string]> = [
    ["Recipient", recipientName],
    ["Payout", quote.payoutMethod],
    ["You send", formatMoney(quote.amount, quote.fromCurrency)],
    ["Network fee", formatMoney(quote.networkFee, quote.fromCurrency)],
    ["Service fee", formatMoney(quote.serviceFee, quote.fromCurrency)],
    ["Total fees", formatMoney(quote.totalFee, quote.fromCurrency)],
    ["Rate", `1 ${quote.fromCurrency} = ${quote.rate.toLocaleString()} ${quote.toCurrency}`],
    ["They receive", formatMoney(quote.receiveAmount, quote.toCurrency)],
    ["Arrival", quote.eta],
  ];

  return (
    <div className="grid gap-4">
      <dl className="rounded-2xl border border-line bg-background px-4 py-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-line py-2.5 text-[15px] last:border-b-0"
          >
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      {!quote.allowed && quote.limitReason ? (
        <LimitNotice reason={quote.limitReason} />
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="lg" type="button" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={handleConfirm}
          disabled={loading || !quote.allowed}
        >
          {loading ? "Sending…" : "Confirm and send"}
        </Button>
      </div>
    </div>
  );
}
