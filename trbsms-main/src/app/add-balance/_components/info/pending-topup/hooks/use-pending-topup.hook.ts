import useRefresh from "@/hooks/use-refresh";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import getPendingTopupAction from "../actions/get-pending-topup.action";

export default function usePendingToptup(): {
  pending: number;
  isLoading: boolean;
} {
  const [pending, setPending] = useState(0);

  const query = useQuery({
    queryKey: ["add-balance", "pending"],
    staleTime: 0,
    queryFn: getPendingTopupAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setPending(query.data.pending);
    else toast.error(query.data.message);
  }, [query.data]);

  useRefresh("/add-balance/pending", query.refetch);

  return {
    isLoading: query.isLoading || query.isFetching,
    pending,
  };
}
