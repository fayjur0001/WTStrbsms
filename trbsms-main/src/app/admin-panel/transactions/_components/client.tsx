"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import getTransactionsAction, {
  Transaction,
} from "./actions/get-transactions.action";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import Filter from "./components/filter";
import { useForm } from "react-hook-form";
import getFilterSchema from "./schemas/filter.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import useRefresh from "@/hooks/use-refresh";
import dateFormat from "@/lib/utils/date-format";

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const limit = 20;

export default function Client({
  walletNames,
}: {
  walletNames: [string, ...string[]];
}) {
  const [page, setPage] = useState(1);

  const queryKey = ["admin-panel", "transactions", String(page)];

  const {
    form,
    submit,
    reset,
    isLoading: isSearchLoading,
  } = useSearch({ walletNames, queryKey, setPage });

  const { isLoading, transactions, totalPages } = useTransactions({
    page,
    filter: form.watch(),
    queryKey,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-4 gap-2">
        <form onSubmit={submit}>
          <Filter
            reset={reset}
            walletNames={walletNames}
            form={form}
            isLoading={isSearchLoading}
          />
        </form>
        <Button type="button" asChild>
          <Link href="/admin-panel/transactions/new">New</Link>
        </Button>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {!!transactions.length ? (
            <table className="table">
              <Thead />
              <tbody>
                {transactions.map((transaction, i) => (
                  <tr
                    key={transaction.id}
                    className={cn({
                      "bg-primary-dark": transaction.status === "pending",
                    })}
                  >
                    <td className="text-center">
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center gap-2">
                        {transaction.walletAddress.length < 15
                          ? transaction.walletAddress
                          : `${transaction.walletAddress.slice(0, 6)}...${transaction.walletAddress.slice(-6)}`}
                        {transaction.walletAddress.length >= 15 && (
                          <CopyButton text={transaction.walletAddress} />
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      {transaction.txid && (
                        <div className="flex items-center gap-2">
                          {transaction.txid.length < 15
                            ? transaction.txid
                            : `${transaction.txid.slice(0, 6)}...${transaction.txid.slice(-6)}`}
                          {transaction.txid.length >= 15 && (
                            <CopyButton text={transaction.txid} />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="text-center">{transaction.walletName}</td>
                    <td className="text-center">
                      <div className="@container">
                        <div className="flex items-center gap-1 justify-center @max-[60px]:flex-col whitespace-nowrap">
                          <span>
                            {dateFormat(transaction.date, { dateOnly: true })}
                          </span>
                          <span>
                            {dateFormat(transaction.date, { timeOnly: true })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">{transaction.username}</td>
                    <td className="text-center">
                      {formatter.format(transaction.amount)}
                    </td>
                    <td className="text-center">
                      <div
                        className={
                          "bg-primary inline-block px-2 py-1 rounded-full shadow-lg text-white"
                        }
                      >
                        {transaction.status === "approved"
                          ? "Confirmed"
                          : transaction.status === "pending"
                            ? "Pending"
                            : "Rejected"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">Transaction not found</p>
          )}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2">
              <Button
                variant={"secondary"}
                size={"sm"}
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft />
              </Button>
              {page}/{totalPages}
              <Button
                variant={"secondary"}
                size={"sm"}
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
          <div className="h-4" />
        </>
      )}
    </div>
  );
}

function CopyButton({ text }: { text?: string }) {
  function copy() {
    if (!text) return;

    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard.");
  }

  return (
    <Button
      size={"icon"}
      className="rounded-full size-7"
      variant={"secondary"}
      onClick={copy}
    >
      <Copy />
    </Button>
  );
}

function Loading() {
  return (
    <table className="table">
      <Thead />
      <tbody>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <tr key={i}>
              {Array(8)
                .fill(0)
                .map((_, j) => (
                  <td key={`${i}-${j}`}>
                    <div className="loading" />
                  </td>
                ))}
            </tr>
          ))}
      </tbody>
    </table>
  );
}

function Thead() {
  return (
    <thead>
      <tr>
        <th className="text-center">#</th>
        <th className="text-center">Wallet Address</th>
        <th className="text-center">TXID</th>
        <th className="text-center">Wallet Name</th>
        <th className="text-center">Date</th>
        <th className="text-center">Username</th>
        <th className="text-center">Amount</th>
        <th className="text-center">Status</th>
      </tr>
    </thead>
  );
}

function useTransactions({
  filter,
  page,
  queryKey,
}: {
  page: number;
  filter: unknown;
  queryKey: string[];
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const query = useQuery({
    queryKey,
    queryFn: () => getTransactionsAction({ page, limit, filter }),
    staleTime: 0,
  });

  useEffect(() => {
    if (!query.data) return;
    if (query.data.success) {
      setTransactions(query.data.transactions);
      setTotalPages(query.data.totalPages);
    } else toast.error(query.data.message);
  }, [query.data]);

  useRefresh(`/admin-panel/transactions`, () => query.refetch);

  return {
    isLoading: query.isLoading || query.isFetching,
    transactions,
    totalPages,
  };
}

function useSearch({
  queryKey,
  setPage,
  walletNames,
}: {
  walletNames: [string, ...string[]];
  queryKey: string[];
  setPage: Dispatch<SetStateAction<number>>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const client = useQueryClient();

  const schema = getFilterSchema(walletNames);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      txid: "",
      username: "",
      walletName: "All",
    },
  });

  const submit = form.handleSubmit(async () => {
    setPage(1);
    setIsLoading(true);
    await client.invalidateQueries({ queryKey });
    setIsLoading(false);
  });

  function reset() {
    setPage(1);
    form.reset();
    client.invalidateQueries({ queryKey });
  }

  return { form, submit, reset, isLoading };
}
