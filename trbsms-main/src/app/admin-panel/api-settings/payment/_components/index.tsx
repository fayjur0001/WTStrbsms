"use client";

import { useQuery } from "@tanstack/react-query";
import getConfigsAction from "./actions/get-configs.action";
import Display from "./components/display";
import Link from "next/link";
import useRefresh from "@/hooks/use-refresh";

export default function Client() {
  const query = useQuery({
    queryFn: getConfigsAction,
    queryKey: ["admin-panel", "api-settings", "payment", "get-configs"],
    staleTime: 0,
  });

  useRefresh("admin-panel/api-settings/payment/get-configs", query.refetch);

  return query.isLoading
    ? null
    : query.data && query.data.success && (
        <div className="space-y-4">
          <div className="space-y-2">
            {query.data.payments.map((entry) => (
              <Display
                method="Now Payments"
                key={entry.label}
                value={entry.value}
                copy={entry.copy}
                label={entry.label}
              />
            ))}
          </div>
          <div className="text-xl">General</div>
          <div className="bg-background p-2 rounded-md flex items-center justify-between">
            Host URL
            <Link
              href={"./payment/edit/host-url"}
              className="break-all bg-primary py-1 px-2 rounded-md hover:bg-primary-dark"
            >
              {query.data.hostUrl || "Not Set"}
            </Link>
          </div>
        </div>
      );
}
