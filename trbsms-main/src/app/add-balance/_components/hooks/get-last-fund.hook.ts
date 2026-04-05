import { useEffect, useState } from "react";
import getLastFundAction from "../actions/get-last-fund.action";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import useRefresh from "@/hooks/use-refresh";

type LastFund = Extract<
  Awaited<ReturnType<typeof getLastFundAction>>,
  { success: true }
>["lastFund"];

export default function useLastFund() {
  const [lastFund, setLastFund] = useState<LastFund>(undefined);

  const query = useQuery({
    queryKey: ["add-balance", "last-fund"],
    queryFn: getLastFundAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setLastFund(query.data.lastFund);
    else toast.error(query.data.message);
  }, [query.data]);

  useRefresh("/add-balance/last-fund", query.refetch);

  return lastFund;
}
