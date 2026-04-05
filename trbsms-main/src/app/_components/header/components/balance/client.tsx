"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Archive } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import getBalanceAction from "./actions/get-balance.action";
import { toast } from "sonner";
import useRefresh from "@/hooks/use-refresh";

const formater = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Balance({ onUpdate }: { onUpdate?: () => void }) {
  const { balance, isLoading } = useBalance(onUpdate);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex gap-2 bg-primary-dark p-2 rounded-full items-center">
      <div className="text-xs ml-2">
        Balance <div className="font-bold">{formater.format(balance)} $</div>
      </div>
      <Topup />
    </div>
  );
}

function Loading() {
  return <div className="loading rounded-full h-10 w-35" />;
}

function Topup() {
  return (
    <Button className="rounded-full text-xs" size={"sm"} asChild>
      <Link href="/add-balance">
        <Archive />
        Top Up
      </Link>
    </Button>
  );
}

function useBalance(onUpdate?: () => void) {
  const [balance, setBalance] = useState(0);

  const query = useQuery({
    queryFn: getBalanceAction,
    queryKey: ["header", "balance"],
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setBalance(query.data.balance);
    else toast.error(query.data.message);

    onUpdate?.();
  }, [onUpdate, query.data]);

  useRefresh("/header/balance", query.refetch);

  return { balance, isLoading: query.isLoading || query.isFetching };
}
