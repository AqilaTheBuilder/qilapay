import Link from "next/link";
import { ROUTES } from "@/lib/site";

/**
 * Explains a blocked amount and points at the fix (verification).
 * Rendered by AmountStep and ReviewStep whenever quote.allowed is false.
 */
export function LimitNotice({ reason }: { reason: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm"
    >
      <p className="font-extrabold text-amber-900">Over your current limit</p>
      <p className="mt-0.5 text-amber-800">{reason}</p>
      <Link
        href={ROUTES.verification}
        className="mt-1.5 inline-block font-bold text-primary-dark underline"
      >
        Raise limits with verification →
      </Link>
    </div>
  );
}
