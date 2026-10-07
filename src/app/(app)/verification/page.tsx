import type { Metadata } from "next";
import { VerificationScreen } from "@/components/verification/VerificationScreen";

export const metadata: Metadata = {
  title: "Verification",
  description: "Compare tiers and raise limits with KYC.",
};

export default function VerificationPage() {
  return <VerificationScreen />;
}
