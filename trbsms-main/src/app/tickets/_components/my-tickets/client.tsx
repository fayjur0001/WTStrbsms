"use client";

import useRefresh from "@/hooks/use-refresh";
import titlecase from "@/lib/utils/titlecase";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import getMyTicketsAction, { Ticket } from "./actions/get-my-tickets.action";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const limit = 20;

export default function MyTickets() {
  const { tickets, page, totalPage, setPage, isLoading } = useTickets();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-primary px-6">My Tickets</h1>
      {isLoading ? (
        <Loading />
      ) : !tickets.length ? (
        <p className="text-center">No tickets available.</p>
      ) : (
        <table className="table">
          <Thead />
          <tbody>
            {tickets.map((ticket, i) => (
              <tr
                key={ticket.id}
                className={cn({
                  "bg-primary-dark text-white": ticket.status === "closed",
                })}
              >
                <TD id={ticket.id}>{(page - 1) * limit + i + 1}</TD>
                <TD id={ticket.id}>{ticket.id}</TD>
                <TD id={ticket.id}>{ticket.subject}</TD>
                <TD id={ticket.id}>{ticket.username}</TD>
                <TD id={ticket.id}>
                  {ticket.totalMessage}/{ticket.readMessage}
                </TD>
                <TD id={ticket.id}>{titlecase(ticket.status)}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {totalPage > 1 && (
        <div className="flex justify-end items-center gap-2">
          <Button
            type="button"
            variant={"secondary"}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft />
          </Button>
          <span>
            {page} of {totalPage}
          </span>
          <Button
            type="button"
            variant={"secondary"}
            disabled={page === totalPage}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}

function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["tickets", "my-tickets", page],
    queryFn: () => getMyTicketsAction({ limit, page }),
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      setTickets(query.data.tickets);
      setTotalPage(query.data.totalPage);
    } else {
      setTickets([]);
      toast.error(query.data.message);
    }
  }, [query.data]);

  useRefresh("/tickets/my-tickets/refresh", query.refetch);

  return {
    tickets,
    isLoading: query.isPending || query.isLoading || query.isFetching,
    totalPage,
    setPage,
    page,
  };
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
              {Array(6)
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
        <th className="text-center">ID</th>
        <th className="text-center">Subject</th>
        <th className="text-center">Username</th>
        <th className="text-center">Message</th>
        <th className="text-center">Status</th>
      </tr>
    </thead>
  );
}

function TD({ children, id }: { children?: ReactNode; id: number }) {
  return (
    <td className="p-0">
      <Link
        className="text-center p-2 inline-block size-full"
        href={`/tickets/${id}`}
      >
        {children}
      </Link>
    </td>
  );
}
