"use client";

import { Badge } from "@/components/ui/badge";
import useRefresh from "@/hooks/use-refresh";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import getNotificationCountAction from "./actions/get-notification-count.action";

const hiddenPaths = ["/tickets"];

export default function Support() {
  const pathname = usePathname();

  const count = useCount();

  return (
    !hiddenPaths.some((hiddenPath) => pathname.startsWith(hiddenPath)) && (
      <Link href={"/tickets"}>
        <div
          className={cn(
            "fixed",
            "bottom-4",
            "right-0",
            "px-4",
            "py-2",
            "bg-primary",
            "rounded-l-full",
            "hover:pr-8",
            "transiton",
            "duration-250",
            "drop-shadow-md",
            "flex",
          )}
        >
          <Mail />
          {!!count && (
            <Badge
              className={cn(
                "text-[10px]",
                "h-5",
                "min-w-5",
                "rounded-full",
                "p-1",
                "font-mono",
                "tabular-nums",
                "bg-white",
                "text-primary",
                "-mt-2",
                "-ml-2",
              )}
            >
              {count}
            </Badge>
          )}
        </div>
      </Link>
    )
  );
}

export function useCount() {
  const [count, setCount] = useState(0);

  const query = useQuery({
    queryKey: ["tickets", "notification", "count"],
    queryFn: getNotificationCountAction,
    staleTime: 0,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setCount(query.data.count);
    else toast.error(query.data.message);
  }, [query.data]);

  useRefresh("tickets/notification/count", query.refetch);

  return count;
}
