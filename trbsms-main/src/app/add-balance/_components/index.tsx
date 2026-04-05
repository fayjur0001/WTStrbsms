"use client";

import Info from "./info";
import NowPayments from "./now-payments";
import TopUpHistory from "./top-up-history/client";
import useLastFund from "./hooks/get-last-fund.hook";

export default function Client() {
  const lastFund = useLastFund();

  return (
    <main className="p-6 space-y-4">
      <NowPayments
        amount={lastFund?.amount}
        currency={lastFund?.currency}
        walletAddress={lastFund?.walletAddress}
      />
      <Info />
      <TopUpHistory />
    </main>
  );
}
