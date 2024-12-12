import { Header } from "@/components/header";
import { WalletTransaction } from "@/modules";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet Transactions - mfoni admin",
};

export default function WalletTransactions() {
  return (
    <>
      <Header />
      <div className="mt-12">
        <WalletTransaction />
      </div>
    </>
  );
}
