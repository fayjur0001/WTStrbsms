"use client";

import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import Card from "../card";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import convertAction from "./actions/convert.action";

export default function Copy({
  address,
  currency,
  amount,
}: {
  address: string;
  currency?: string;
  amount?: number;
}) {
  function copy() {
    navigator.clipboard.writeText(address).then(() => {
      toast.success("Address copied to clipboard.");
    });
  }

  return (
    <Card className=" flex-1 text-center flex items-center justify-center gap-2">
      <div className="space-y-2">
        {currency && amount && <CopyInfo amount={amount} currency={currency} />}
        {address}
        <Button
          size={"icon"}
          className="rounded-full bg-primary-dark text-primary"
          variant={"ghost"}
          onClick={copy}
        >
          <CopyIcon />
        </Button>
      </div>
    </Card>
  );
}

function CopyInfo({ currency, amount }: { currency: string; amount: number }) {
  const { isLoading, convertedAmount } = useConvert(amount, currency);

  return (
    <div>
      {isLoading ? (
        <div className="loading" />
      ) : (
        <span>
          Send exactly {convertedAmount} {currency} to this address
        </span>
      )}
    </div>
  );
}

function useConvert(
  amount: number,
  currency: string,
): { isLoading: boolean; convertedAmount: number } {
  const [convertedAmount, setConvertedAmount] = useState(0);

  const query = useQuery({
    queryKey: ["add-balance", "now-payments", "convert", amount, currency],
    queryFn: () => convertAction({ amount, currency }),
  });

  useEffect(() => {
    if (!query.data) return;
    if (query.data.success) setConvertedAmount(query.data.convertedAmount);
    else toast.error(query.data.message);
  }, [query.data]);

  return { convertedAmount, isLoading: query.isLoading };
}
