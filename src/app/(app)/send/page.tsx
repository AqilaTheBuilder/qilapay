import type { Metadata } from "next";
import { SendScreen } from "@/components/send/SendScreen";

export const metadata: Metadata = {
  title: "Send money",
  description: "Recipient, amount, review, done. Limits checked at every step.",
};

export default function SendPage() {
  return <SendScreen />;
}
