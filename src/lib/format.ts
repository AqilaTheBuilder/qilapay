/**
 * Formatting helpers shared across landing + future dashboard/pay pages.
 * Keep this file pure (no React) so it stays testable.
 */

/** Example: formatMoney(1000, "USD") -> "$1,000.00" */
export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Display a full transfer route, e.g. "$1,000.00 → Rp17,834,400.00" */
export function formatTransferRoute(
  sendAmount: number,
  sendCurrency: string,
  receiveAmount: number,
  receiveCurrency: string,
): string {
  return `${formatMoney(sendAmount, sendCurrency)} → ${formatMoney(
    receiveAmount,
    receiveCurrency,
  )}`;
}
