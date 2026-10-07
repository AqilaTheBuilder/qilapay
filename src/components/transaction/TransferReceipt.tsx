import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMoney } from "@/lib/format";
import type { Transfer } from "@/lib/api/types";

/**
 * Full receipt for one transfer. Rendered on the success step and on
 * transactions/[id]. One component so both can never drift apart.
 */
export function TransferReceipt({ transfer }: { transfer: Transfer }) {
  const tone =
    transfer.status === "Completed"
      ? ("success" as const)
      : transfer.status === "Processing"
        ? ("pending" as const)
        : ("failed" as const);

  const rows: Array<[string, string]> = [
    ["Transfer ID", transfer.id],
    ["Recipient", `${transfer.recipient} (${transfer.payoutMethod})`],
    [
      "You sent",
      formatMoney(transfer.amount, transfer.currency),
    ],
    [
      "They receive",
      formatMoney(transfer.receiveAmount, transfer.receiveCurrency),
    ],
    ["Reference", transfer.txHash],
    ["Date", transfer.date],
  ];

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight">Receipt</h2>
        <StatusBadge tone={tone}>{transfer.status}</StatusBadge>
      </div>
      <dl className="mt-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-line py-2.5 text-[15px] last:border-b-0"
          >
            <dt className="text-muted">{label}</dt>
            <dd className="break-all text-right font-bold">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
