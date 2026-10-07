import type { Metadata } from "next";
import { TransactionDetailScreen } from "@/components/transaction/TransactionDetailScreen";

export const metadata: Metadata = {
  title: "Receipt",
  description: "Transfer receipt with reference.",
};

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransactionDetailScreen id={id} />;
}
