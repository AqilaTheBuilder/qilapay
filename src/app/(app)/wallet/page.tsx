import type { Metadata } from "next";
import { WalletScreen } from "@/components/wallet/WalletScreen";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Self-custody balances and receive address.",
};

export default function WalletPage() {
  return <WalletScreen />;
}
