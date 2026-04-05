"use client";

import { CSSProperties, useEffect, useState } from "react";
import useProxies from "./hooks/get-proxies.hook";
import titlecase from "@/lib/utils/titlecase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChangePort from "./components/change-port";
import Redial from "./components/redial/index";

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function History() {
  const [page, setPage] = useState(1);

  const { isLoading, proxies, totalPage } = useProxies(page, 20);

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref) return;

    const observer = new ResizeObserver((entries) => {
      setHeight(entries.at(0)?.target.clientHeight || 0);
    });

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return (
    <div className="h-full bg-background-dark p-4 rounded-md">
      <div className="h-full">
        <div ref={setRef}>
          <div className="h-2" />
          <div className="text-2xl font-bold text-primary">History</div>
          <div className="h-4" />
        </div>
        <div
          className="overflow-y-auto h-[calc(100%_-_var(--height)_-_--spacing(4))] space-y-4"
          style={{ "--height": `${height}px` } as CSSProperties}
        >
          {isLoading ? (
            <Loading />
          ) : !!proxies.length ? (
            <>
              <table className="table">
                <Thead />
                <tbody>
                  {proxies.map((proxy) => (
                    <tr
                      key={proxy.id}
                      className={cn({ "bg-muted-foreground": proxy.isExpired })}
                    >
                      <td className="text-center">{proxy.port}</td>
                      <td className="text-center">{proxy.proxyCarrier}</td>
                      <td className="text-center">{proxy.proxyUser}</td>
                      <td className="text-center">{proxy.proxyPass}</td>
                      <td className="text-center">{proxy.proxyIp}</td>
                      <td className="text-center">{proxy.proxySocksPort}</td>
                      <td className="text-center">{proxy.proxyHttpPort}</td>
                      <td className="text-center">
                        {titlecase(proxy.proxyType)}
                      </td>
                      <td className="text-center">
                        {formatter.format(proxy.price)}
                      </td>
                      <td>
                        <div className="flex gap-2 items-center justify-center">
                          {!proxy.isExpired && <ChangePort id={proxy.id} />}
                          {!proxy.isExpired &&
                            proxy.proxyType === "exclusive" && (
                              <Redial id={proxy.id} />
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPage > 1 && (
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant={"secondary"}
                    size={"icon"}
                    onClick={() => setPage((page) => page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft />
                  </Button>
                  <span>
                    {page}/{totalPage}
                  </span>
                  <Button
                    variant={"secondary"}
                    size={"icon"}
                    onClick={() => setPage((page) => page + 1)}
                    disabled={page >= totalPage}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p>You haven&apos;t rented any proxies.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <table className="table">
      <Thead />
      <tbody>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <tr key={i}>
              {Array(10)
                .fill(0)
                .map((_, j) => (
                  <td key={`${i}-${j}`}>
                    <div className="loading" />
                  </td>
                ))}
            </tr>
          ))}
      </tbody>
    </table>
  );
}

function Thead() {
  return (
    <thead>
      <tr>
        <th className="text-center">Port #</th>
        <th className="text-center">Proxy Carrier</th>
        <th className="text-center">Proxy User</th>
        <th className="text-center">Proxy Pass</th>
        <th className="text-center">Proxy IP</th>
        <th className="text-center">Socks Port</th>
        <th className="text-center">Http Port</th>
        <th className="text-center">Proxy Type</th>
        <th className="text-center">Price</th>
        <th className="text-center">Actions</th>
      </tr>
    </thead>
  );
}
