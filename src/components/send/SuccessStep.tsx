import { Button } from "@/components/ui/Button";
import { TransferReceipt } from "@/components/transaction/TransferReceipt";
import { ROUTES } from "@/lib/site";
import type { Transfer } from "@/lib/api/types";

/** Step 4: confirmation plus receipt plus next actions. */
export function SuccessStep({ transfer }: { transfer: Transfer }) {
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-center">
        <p className="text-3xl" aria-hidden>
          ✓
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-emerald-900">
          Transfer submitted
        </h2>
        <p className="mt-0.5 text-sm text-emerald-800">
          {transfer.status === "Completed"
            ? "Confirmed. The receipt below is final."
            : "Processing. This page will show Confirmed shortly."}
        </p>
      </div>

      <TransferReceipt transfer={transfer} />

      <div className="flex flex-wrap gap-3">
        <Button href={`${ROUTES.transactions}/${transfer.id}`} variant="secondary" size="lg">
          View in history
        </Button>
        <Button href={ROUTES.dashboard} size="lg">
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
