import useRefresh from "@/hooks/use-refresh";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import getTicketsAction from "../actions/get-tickets.action";
import { toast } from "sonner";

type Ticket = Extract<
  Awaited<ReturnType<typeof getTicketsAction>>,
  { success: true }
>["tickets"][number];

export default function useTickets(page: number, limit: number) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const query = useQuery({
    queryKey: ["tickets", "other", page],
    queryFn: () => getTicketsAction({ page, limit }),
    staleTime: 0,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      setTickets(query.data.tickets);
      setTotalPages(query.data.totalPages);
    } else toast.error(query.data.message);
  }, [query.data]);

  useRefresh(`/tickets/other`, query.refetch);

  return {
    tickets,
    isLoading: query.isLoading || query.isFetching,
    totalPages,
  };
}
