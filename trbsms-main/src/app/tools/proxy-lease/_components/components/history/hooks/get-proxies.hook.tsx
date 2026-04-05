import useRefresh from "@/hooks/use-refresh";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import getProxiesAction from "../actions/get-proxies.action";

type Proxy = Extract<
  Awaited<ReturnType<typeof getProxiesAction>>,
  { success: true }
>["proxies"][number];

export default function useProxies(page: number, limit = 20) {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [totalPage, setTotalPage] = useState(1);

  const query = useQuery({
    queryKey: ["proxy-lease", "history", page],
    queryFn: () => getProxiesAction({ page, limit }),
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      setProxies(query.data.proxies);
      setTotalPage(query.data.totalPage);
    } else toast.error(query.data.message);
  }, [query.data]);

  useRefresh("/proxy-lease/history", (payload) => {
    if (page === 1 && payload.action === "new") {
      query.refetch();
    } else if (
      payload.action === "update" &&
      proxies.some((proxy) => proxy.id === payload.id)
    ) {
      query.refetch();
    }
  });

  return { isLoading: query.isLoading, proxies, totalPage };
}
