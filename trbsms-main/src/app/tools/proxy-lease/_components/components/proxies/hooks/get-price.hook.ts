import SiteOptions from "@/lib/utils/site-options";
import { useCallback } from "react";
import getHours from "../utils/get-hours";
import calculatePrice from "../utils/calculate-price";

type Prices = {
  shared: Awaited<ReturnType<typeof SiteOptions.sharedProxyPrice.get>>;
  exclusive: Awaited<ReturnType<typeof SiteOptions.exclusiveProxyPrice.get>>;
};

export default function usePrice({
  unit,
  unitType,
  prices,
  proxyType,
  adminCut,
}: {
  unit: number;
  unitType: string;
  prices: Prices;
  proxyType: string;
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
}): () => number {
  const price = useCallback(() => {
    const hours = getHours(unit, unitType);

    const p = calculatePrice({ hours, prices, proxyType });

    const cut =
      proxyType === "shared"
        ? hours >= 24 * 30
          ? adminCut.shared.month
          : hours >= 24 * 7
            ? adminCut.shared.week
            : adminCut.shared.day
        : hours >= 24 * 30
          ? adminCut.exclusive.month
          : hours >= 24 * 7
            ? adminCut.exclusive.week
            : adminCut.exclusive.day;

    return p + (p * cut) / 100;
  }, [
    adminCut.exclusive.day,
    adminCut.exclusive.month,
    adminCut.exclusive.week,
    adminCut.shared.day,
    adminCut.shared.month,
    adminCut.shared.week,
    prices,
    proxyType,
    unit,
    unitType,
  ]);

  return price;
}
