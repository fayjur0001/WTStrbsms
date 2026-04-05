"use client";

import useTotalTopup from "./hooks/use-total-topup.hook";

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function TotalTopup() {
  const { total, isLoading } = useTotalTopup();

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <div className="text-2xl font-bold text-primary capitalize">
        total topup
      </div>
      {isLoading ? (
        <div className="loading w-18" />
      ) : (
        <div>$ {formatter.format(total)}</div>
      )}
    </div>
  );
}
