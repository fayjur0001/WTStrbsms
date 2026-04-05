"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import getMdnsAction, { Mdn } from "./actions/get-mdns.action";
import dateFormat from "@/lib/utils/date-format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useRefresh from "@/hooks/use-refresh";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Reject from "./components/reject/client";
import Reuse from "./components/reuse/client";
import Filter from "./conponents/filter";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import getSchema from "./schemas/filter.schema";
import RemainingTime from "./components/remaining-time";

type Statuses = [string, ...string[]];

export default function History({
  statuses,
}: {
  statuses: [string, ...string[]];
}) {
  const [page, setPage] = useState(1);

  const queryKey = ["tools", "receive-sms", "history", page.toString()];

  const {
    search,
    reset,
    form,
    isLoading: isSearchLoading,
  } = useSearch({ statuses, queryKey, setPage });

  const { mdns, isLoading, totalPages } = useMdns({
    filter: form.watch(),
    page,
    queryKey,
  });

  const currentTime = useCurrentTime();

  return (
    <div className="bg-background-dark p-4 rounded-md space-y-4 h-[calc(50%_-_--spacing(2))] overflow-auto">
      <h1 className="text-2xl text-primary font-bold">History</h1>
      <Form {...form}>
        <form onSubmit={search}>
          <Filter
            onReset={reset}
            control={form.control}
            statuses={statuses}
            isLoading={isSearchLoading}
          />
        </form>
      </Form>
      {isLoading || isSearchLoading ? (
        <Loading />
      ) : !!mdns.length ? (
        <table className="table">
          <Thead />
          <tbody>
            {mdns.map((mdn, i) => (
              <tr
                key={mdn.id}
                className={cn({
                  "bg-primary text-white": mdn.status === "Expired",
                  "bg-white text-black": mdn.status === "Completed",
                })}
              >
                <td className="text-center">{i + 1}</td>
                <td className="text-center">{mdn.username}</td>
                <td className="text-center">{dateFormat(mdn.date)}</td>
                <td className="text-center">{mdn.service}</td>
                <td className="text-center">{mdn.mdn}</td>
                <td className="text-center">${mdn.price.toFixed(2)}</td>
                <td className="text-center">{mdn.status}</td>
                <td className="text-center">
                  {["Reserved", "Awaiting MDN", "Active"].includes(
                    mdn.status,
                  ) ? (
                    <RemainingTime
                      currentDate={currentTime}
                      createdAt={mdn.date}
                      limit={mdn.limit}
                    />
                  ) : (
                    mdn.message
                  )}
                </td>
                <td className="text-center">{mdn.pin}</td>
                <td>
                  <div className="flex justify-center items-center">
                    {["Reserved", "Awaiting MDN", "Active"].includes(
                      mdn.status,
                    ) && <Reject id={mdn.id} />}
                    {["Expired", "Completed", "Rejected"].includes(
                      mdn.status,
                    ) && <Reuse id={mdn.id} price={mdn.price} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center">You didn&apos;t bought any service</p>
      )}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft />
          </Button>
          <span>
            {page} of {totalPages}
          </span>
          <Button
            size="icon"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
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
              {Array(10)
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
        <th className="text-center w-0">#</th>
        <th className="text-center">User</th>
        <th className="text-center">Time &amp; Date</th>
        <th className="text-center">Service</th>
        <th className="text-center">Mobile Number</th>
        <th className="text-center">Price</th>
        <th className="text-center">Status</th>
        <th className="text-center">Message</th>
        <th className="text-center">Pin</th>
        <th className="text-center w-0">Action</th>
      </tr>
    </thead>
  );
}

const limit = 20;

function useMdns({
  filter,
  page,
  queryKey,
}: {
  page: number;
  filter: unknown;
  queryKey: string[];
}) {
  const [mdns, setMdns] = useState<Mdn[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const query = useQuery({
    queryKey,
    queryFn: () => getMdnsAction({ page, limit, filter }),
    refetchInterval: 1000 * 60,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      setMdns(query.data.mdns);
      setTotalPages(query.data.totalPages);
    } else toast.error(query.data.message);
  }, [query.data]);

  useRefresh("/tools/receive-sms", query.refetch);

  return {
    mdns,
    page,
    totalPages,
    isLoading: query.isLoading || (query.isFetching && !query.isRefetching),
  };
}

function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState<Date | undefined>();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  });

  return currentTime;
}

function useSearch({
  queryKey,
  setPage,
  statuses,
}: {
  statuses: Statuses;
  queryKey: string[];
  setPage: Dispatch<SetStateAction<number>>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const client = useQueryClient();

  const schema = getSchema(statuses);

  const form = useForm({
    defaultValues: {
      service: "",
      mdn: "",
      status: "All",
    },
    resolver: zodResolver(schema),
  });

  const search = form.handleSubmit(async () => {
    setIsLoading(true);
    setPage(1);
    await client.invalidateQueries({ queryKey });
    setIsLoading(false);
  });

  async function reset() {
    setIsLoading(false);
    form.reset();
    await search();
    setIsLoading(false);
  }

  return { search, reset, form, isLoading };
}
