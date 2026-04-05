"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import getServicesAction from "./actions/get-services.action";
import dateFormat from "@/lib/utils/date-format";
import titlecase from "@/lib/utils/titlecase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import Filter from "./components/filter";
import { zodResolver } from "@hookform/resolvers/zod";
import getSchema from "./schemas/filter.schema";
import useRefresh from "@/hooks/use-refresh";
import Release from "./components/release/client";
import ActiveMdn from "./components/active-mdn/client";
import ViewSms from "./components/view-sms/client";
import Renew from "./components/renew";

type Response = Awaited<ReturnType<typeof getServicesAction>>;
type Service = Extract<Response, { success: true }>["services"][number];

const limit = 20;

export default function History({
  onlineStatusArray,
  statusArray,
}: {
  onlineStatusArray: [string, ...string[]];
  statusArray: [string, ...string[]];
}) {
  const [page, setPage] = useState(1);

  const queryKey = ["tools", "rent", "history", page.toString()];

  const {
    form,
    search,
    reset,
    isLoading: isSearchLoading,
  } = useSearch({
    onlineStatusArray,
    queryKey,
    statusArray,
  });

  const { services, isLoading, totalPage } = useService({
    page,
    filter: form.watch(),
    queryKey,
  });

  return (
    <div className="bg-background-dark p-4 rounded-md space-y-4 h-[calc(50%_-_--spacing(2))] overflow-auto">
      <div className="text-2xl font-bold text-primary">History</div>
      <form onSubmit={search}>
        <Form {...form}>
          <Filter
            control={form.control}
            onlineStatusArray={onlineStatusArray}
            statusArray={statusArray}
            onReset={reset}
            isLoading={isSearchLoading}
          />
        </Form>
      </form>
      {isLoading || isSearchLoading ? (
        <Loading />
      ) : !!services.length ? (
        <table className="table">
          <Thead />
          <tbody>
            {services.map((service, i) => (
              <tr key={service.id}>
                <td className="text-center">{i + 1}</td>
                <td className="text-center">{service.username}</td>
                <td className="text-center">{service.service}</td>
                <td className="text-center">{service.mdn}</td>
                <td className="text-center">$ {service.price.toFixed(2)}</td>
                <td className="text-center">
                  {dateFormat(service.purchasedDate)}
                </td>
                <td className="text-center">
                  {dateFormat(service.expireDate)}
                </td>
                <td className="text-center">{service.lastIncoming}</td>
                <td className="text-center">
                  {titlecase(service.onlineStatus)}
                </td>
                <td className="text-center">{service.status}</td>
                <td className="text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Release id={service.id} />
                    {service.status === "Active" && (
                      <ActiveMdn id={service.id} />
                    )}
                    <ViewSms id={service.id} />
                    {["Expired", "Rejected", "Completed", "Timed Out"].includes(
                      service.status,
                    ) && <Renew id={service.id} service={service.service} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center">You haven&apos;t rented any.</p>
      )}
      {totalPage > 1 && (
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft />
          </Button>
          <span>
            {page} of {totalPage}
          </span>
          <Button
            variant="secondary"
            size="icon"
            disabled={page >= totalPage}
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
              {Array(11)
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
        <th className="text-center">Service</th>
        <th className="text-center">Mobile Number</th>
        <th className="text-center">Price</th>
        <th className="text-center">Purchased</th>
        <th className="text-center">Expires</th>
        <th className="text-center">Last Incoming</th>
        <th className="text-center">Online Status</th>
        <th className="text-center">Status</th>
        <th className="text-center">Action</th>
      </tr>
    </thead>
  );
}

function useService({
  filter,
  page,
  queryKey,
}: {
  page: number;
  filter: unknown;
  queryKey: string[];
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [totalPage, setTotalPage] = useState(1);

  const query = useQuery({
    queryKey,
    queryFn: () => getServicesAction({ page, limit, filter }),
    refetchInterval: 1000 * 60,
  });

  useRefresh("/tools/rent/history", query.refetch);

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      setServices(query.data.services);
      setTotalPage(query.data.totalPage);
    } else toast.error(query.data.message);
  }, [query.data]);

  return {
    services,
    isLoading: query.isLoading || (query.isFetching && !query.isRefetching),
    totalPage,
  };
}

function useSearch({
  onlineStatusArray,
  statusArray,
  queryKey,
}: {
  onlineStatusArray: [string, ...string[]];
  statusArray: [string, ...string[]];
  queryKey: string[];
}) {
  const [isLoading, setIsLoading] = useState(false);

  const client = useQueryClient();

  const schema = getSchema(onlineStatusArray, statusArray);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      service: "",
      mdn: "",
      onlineStatus: "All",
      status: "All",
    },
  });

  const search = form.handleSubmit(async () => {
    setIsLoading(true);
    await client.invalidateQueries({ queryKey });
    setIsLoading(false);
  });

  function reset() {
    form.reset();
    search();
  }

  return {
    form,
    reset,
    search,
    isLoading,
  };
}
