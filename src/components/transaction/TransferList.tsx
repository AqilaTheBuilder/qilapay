import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMoney } from "@/lib/format";
import type { Transfer, TransferStatus } from "@/lib/api/types";

function toneFor(status: TransferStatus) {
  if (status === "Completed") return "success" as const;
  if (status === "Processing") return "pending" as const;
  return "failed" as const;
}

/** One row in transfer history. Links to the receipt page. */
export function TransferListItem({ transfer }: { transfer: Transfer }) {
  return (
    <Link
      href={`/transactions/${transfer.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors hover:border-primary"
    >
      <div>
        <p className="font-extrabold">{transfer.recipient}</p>
        <p className="text-sm text-muted">
          {transfer.id} · {transfer.date}
        </p>
      </div>
      <div className="text-right">
        <p className="font-extrabold">
          {formatMoney(transfer.amount, transfer.currency)}
        </p>
        <StatusBadge tone={toneFor(transfer.status)}>
          {transfer.status}
        </StatusBadge>
      </div>
    </Link>
  );
}

/** History list with an empty state. Reused by dashboard and transactions. */
export function TransferList({ transfers }: { transfers: Transfer[] }) {
  if (transfers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface px-4 py-8 text-center text-muted">
        No transfers yet. Send your first one to see it here.
      </div>
    );
  }
  return (
    <div className="grid gap-2.5">
      {transfers.map((transfer) => (
        <TransferListItem key={transfer.id} transfer={transfer} />
      ))}
    </div>
  );
}
