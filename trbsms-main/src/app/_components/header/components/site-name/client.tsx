"use client";

import useRefresh from "@/hooks/use-refresh";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import getSiteNameAction from "./actions/get-site-name.action";

export default function SiteName({ onUpdate }: { onUpdate: () => void }) {
  const { siteName, isLoading } = useSiteName(onUpdate);
  return isLoading ? (
    <div className="loading w-20" />
  ) : (
    <Link className="text-primary font-bold text-xl" href="/">
      {siteName}
    </Link>
  );
}

function useSiteName(onUpdate: () => void) {
  const [siteName, setSiteName] = useState("DrkSMS");

  const query = useQuery({
    queryFn: getSiteNameAction,
    queryKey: ["header", "site-name"],
  });

  useRefresh("/header/site-name", query.refetch);

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setSiteName(query.data.siteName);
    else toast.error(query.data.message);

    onUpdate();
  }, [onUpdate, query.data]);

  return { siteName, isLoading: query.isLoading || query.isFetching };
}
