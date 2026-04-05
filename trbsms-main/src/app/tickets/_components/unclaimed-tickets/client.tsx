"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import getUnclaimedTicketsAction, {
  Ticket,
} from "./actions/getUnclaimedTickets.action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Claim from "./components/claim/client";
import useRefresh from "@/hooks/use-refresh";
import Link from "next/link";

const limit = 20;

export default function UnclaimedTickets() {
  const { tickets, page, totalPages, setPage } = useTickets();
  return (
    !!tickets.length && (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-primary px-6">
          Unclaimed Tickets
        </h1>
        <table className="table">
          <Thead />
          <tbody>
            {tickets.map((ticket, i) => (
              <tr key={ticket.id}>
                <TD.Context value={{ id: ticket.id }}>
                  <TD>{(page - 1) * limit + i + 1}</TD>
                  <TD>{ticket.id}</TD>
                  <TD>{dateFormat(ticket.date)}</TD>
                  <TD>{ticket.subject}</TD>
                  <TD>{ticket.username}</TD>
                  <TD>{ticket.totalMessages}</TD>
                </TD.Context>
                <td className="w-0">
                  <div className="flex justify-center items-center">
                    <Claim ticketId={ticket.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant={"secondary"}
              type="button"
              size={"icon"}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft />
            </Button>
            <span>
              {page}/{totalPages}
            </span>
            <Button
              variant={"secondary"}
              type="button"
              size={"icon"}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
    )
  );
}

function TD({ children }: { children: ReactNode }) {
  const { id } = useContext(TD.Context);

  return (
    <td className="text-center p-0">
      <Link href={`/tickets/${id}`} className="block size-full py-3">
        {children}
      </Link>
    </td>
  );
}

TD.Context = createContext({
  id: 0,
});

function Thead() {
  return (
    <thead>
      <tr>
        <th className="text-center">#</th>
        <th className="text-center">ID</th>
        <th className="text-center">Date</th>
        <th className="text-center">Subject</th>
        <th className="text-center">Username</th>
        <th className="text-center">Messages</th>
        <th className="text-center">Actions</th>
      </tr>
    </thead>
  );
}

function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const query = useQuery({
    queryKey: ["tickets", "unclaimed-tickets", page],
    queryFn: () => getUnclaimedTicketsAction({ page, limit }),
  });

  useEffect(() => {
    if (!query.data) return;
    if (query.data.success) {
      setTickets(query.data.tickets);
      setTotalPages(query.data.totalPages);
    } else {
      toast.error(query.data.message);
    }
  }, [query.data]);

  useRefresh("/tickets/unclaimed-tickets/refresh", query.refetch);

  return {
    tickets,
    page,
    totalPages,
    setPage,
  };
}

function dateFormat(date: Date) {
  return `${String(date.getFullYear()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
