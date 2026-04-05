import useRefresh from "@/hooks/use-refresh";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import getTotalTopupAction from "../actions/get-total-topup.action";

export default function useTotalTopup() {
  const [total, setTotal] = useState(0);

  const query = useQuery({
    queryKey: ["add-balance", "total-topup"],
    staleTime: 0,
    queryFn: getTotalTopupAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setTotal(query.data.total);
    else toast.error(query.data.message);
  }, [query.data]);

  useRefresh("/add-balance/total-topup", query.refetch);

  return {
    total,
    isLoading: query.isLoading || query.isFetching,
  };
}
