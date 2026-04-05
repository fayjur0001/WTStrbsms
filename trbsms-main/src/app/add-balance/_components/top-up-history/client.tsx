"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import getAlltransactionsAction, {
  Transaction,
} from "./components/get-all-transactions.action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import titlecase from "@/lib/utils/titlecase";
import dateFormat from "@/lib/utils/date-format";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useRefresh from "@/hooks/use-refresh";
import Card from "../card";

const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPage, setTotalPage] = useState(1);

  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const query = useQuery({
    queryKey: ["add-balance/all-transactions", page],
    queryFn: () => getAlltransactionsAction({ page }),
  });

  useRefresh("/add-balance/history", query.refetch);

  useEffect(() => {
    if (query.data) {
      if (query.data.success) {
        setTransactions(query.data.transactions);
        setTotalPage(query.data.totalPage);
      } else {
        toast.error(query.data.message);
      }
    }
  }, [query.data]);

  return {
    transactions,
    isLoading: query.isPending || query.isFetching,
    page,
    totalPage,
  };
}

export default function TopUpHistory() {
  const { transactions, isLoading, page, totalPage } = useTransactions();

  return (
    <Card className="space-y-4">
      <h1 className="text-primary text-2xl font-bold">Top up history</h1>
      {!!transactions.length ? (
        <>
          <Table transactions={transactions} isLoading={isLoading} />
          {totalPage > 1 && <Pagination page={page} totalPage={totalPage} />}
        </>
      ) : (
        <p>No transaction found</p>
      )}
    </Card>
  );
}

function Table({
  transactions,
  isLoading,
}: {
  transactions: Transaction[];
  isLoading: boolean;
}) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>TxID/Hash ID</th>
          <th>Wallet Name</th>
          <th>Wallet Address</th>
          <th>Creation Date</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <Loading />
        ) : (
          transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className={cn(
                {
                  "bg-primary-dark": transaction.status === "rejected",
                  "bg-white text-black": transaction.status === "approved",
                },
                "border-b-background-dark",
              )}
            >
              <td>{transaction.txId}</td>
              <td>{transaction.walletName}</td>
              <td>{transaction.walletAddress}</td>
              <td>{dateFormat(transaction.creationDate)}</td>
              <td>{formatter.format(transaction.amount)}</td>
              <td>
                <Status status={transaction.status} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function Status({ status, className }: { status: string; className?: string }) {
  return (
    <div
      className={cn(
        "bg-primary shadow rounded-full inline-block px-4 py-1 text-white",
        className,
      )}
    >
      {titlecase(status)}
    </div>
  );
}

function Loading() {
  return Array(20)
    .fill(0)
    .map((_, i) => (
      <tr className="border-none" key={i}>
        {Array(6)
          .fill(0)
          .map((_, j) => (
            <td key={`${i}-${j}`}>
              <div className="loading" />
            </td>
          ))}
      </tr>
    ));
}

function Pagination({ page, totalPage }: { page: number; totalPage: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  function goto(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex justify-end items-center gap-2">
      <Button
        size={"icon"}
        variant={"secondary"}
        disabled={page === 1}
        onClick={() => goto(page - 1)}
      >
        <ChevronLeft />
      </Button>
      {page} of {totalPage}
      <Button
        size={"icon"}
        variant={"secondary"}
        disabled={page === totalPage}
        onClick={() => goto(page + 1)}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
