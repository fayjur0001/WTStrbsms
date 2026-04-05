"use client";

import { useAtomValue } from "jotai";
import Proxies from "./components/proxies";
import headerHeightAtom from "@/atoms/header-height.atom";
import SiteOptions from "@/lib/utils/site-options";
import History from "./components/history";
import { CSSProperties } from "react";

type Prices = {
  shared: Awaited<ReturnType<typeof SiteOptions.sharedProxyPrice.get>>;
  exclusive: Awaited<ReturnType<typeof SiteOptions.exclusiveProxyPrice.get>>;
};

const unitTypeEnumArray = ["hour", "day", "week", "month"] as [
  string,
  ...string[],
];

const proxyTypeEnumArray = ["shared", "exclusive"] as [string, ...string[]];

export default function Client({
  services,
  prices,
  adminCut,
}: {
  services: [string, ...string[]];
  prices: Prices;
  adminCut: {
    shared: {
      day: number;
      week: number;
      month: number;
    };
    exclusive: {
      day: number;
      week: number;
      month: number;
    };
  };
}) {
  const headerHeight = useAtomValue(headerHeightAtom);

  return (
    <main
      className="p-4 overflow-hidden h-[calc(100vh_-_var(--header-height))]"
      style={{ "--header-height": `${headerHeight}px` } as CSSProperties}
    >
      <div className="h-1/2">
        <div className="h-[calc(100%_-_--spacing(2))]">
          <Proxies
            services={services}
            proxyTypeEnumArray={proxyTypeEnumArray}
            unitTypeEnumArray={unitTypeEnumArray}
            adminCut={adminCut}
            prices={prices}
          />
        </div>
        <div className="h-2 z-10" />
      </div>
      <div className="h-1/2">
        <div className="h-2" />
        <div className="h-[calc(100%_-_--spacing(2))]">
          <History />
        </div>
      </div>
    </main>
  );
}
