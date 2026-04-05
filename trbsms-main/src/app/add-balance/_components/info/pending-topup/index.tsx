"use client";

import usePendingToptup from "./hooks/use-pending-topup.hook";

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function PendingTopup() {
  const { isLoading, pending } = usePendingToptup();

  return (
    <div className="flex flex-col items-center gap-2 justify-center">
      <div className="text-2xl font-bold text-primary">Pending Topup</div>
      {isLoading ? (
        <div className="loading w-18" />
      ) : (
        <div>$ {formatter.format(pending)}</div>
      )}
    </div>
  );
}
