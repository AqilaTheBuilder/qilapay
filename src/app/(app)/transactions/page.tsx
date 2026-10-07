import type { Metadata } from "next";
import { TransactionsScreen } from "@/components/transaction/TransactionsScreen";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Full transfer history with receipts.",
};

export default function TransactionsPage() {
  return <TransactionsScreen />;
}
