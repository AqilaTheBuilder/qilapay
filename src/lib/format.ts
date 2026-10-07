/**
 * Formatting helpers shared across landing and app screens.
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

/** Compact USD for meters and badges, e.g. 2500 -> "$2,500". */
export function formatUsdShort(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

/** Shorten a wallet address for display, e.g. "0x7f…Q2a". */
export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-3)}`;
}
