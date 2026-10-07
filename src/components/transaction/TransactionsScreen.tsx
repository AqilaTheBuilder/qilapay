"use client";

import { useEffect, useState } from "react";
import { TransferList } from "@/components/transaction/TransferList";
import { getApi, type Transfer } from "@/lib/api";

/** Full history screen with a simple status filter. */
export function TransactionsScreen() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filter, setFilter] = useState<"All" | "Completed" | "Processing">("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getApi()
      .listTransfers()
      .then((list) => {
        if (!cancelled) {
          setTransfers(list);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const visible =
    filter === "All" ? transfers : transfers.filter((t) => t.status === filter);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">History</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Transactions</h1>
        </div>
        <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
          {(["All", "Completed", "Processing"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-bold transition-colors",
                filter === option ? "bg-night text-white" : "text-muted hover:text-ink",
              ].join(" ")}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-muted">Loading transactions…</p>
      ) : (
        <TransferList transfers={visible} />
      )}
    </div>
  );
}
