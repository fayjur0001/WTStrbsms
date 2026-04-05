import { useEffect, useState } from "react";
import getProxies from "../actions/get-proxies.action";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import getSchema from "../schemas/get-filter.schema";
import { z } from "zod";

type Proxy = Extract<
  Awaited<ReturnType<typeof getProxies>>,
  { success: true }
>["proxies"][number];

type ProxyType = z.infer<ReturnType<typeof getSchema>>["proxyType"];

export default function useProxies(proxyType: ProxyType): {
  isLoading: boolean;
  proxies: Proxy[];
} {
  const [proxies, setProxies] = useState<Proxy[]>([]);

  const query = useQuery({
    queryFn: getProxies,
    queryKey: ["proxies", "ports"],
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success)
      setProxies(
        query.data.proxies.filter(
          (proxy) =>
            (proxyType === "shared" && !proxy.isExclusive) ||
            (proxyType === "exclusive" && !!proxy.isExclusive),
        ),
      );
    else toast.error(query.data.message);
  }, [proxyType, query.data]);

  return { proxies, isLoading: query.isLoading };
}
