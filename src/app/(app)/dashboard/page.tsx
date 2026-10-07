import type { Metadata } from "next";
import { DashboardScreen } from "@/components/dashboard/DashboardScreen";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Balances, limits, and recent transfers.",
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
