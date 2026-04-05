import SiteOptions from "@/lib/utils/site-options";

type Prices = {
  shared: Awaited<ReturnType<typeof SiteOptions.sharedProxyPrice.get>>;
  exclusive: Awaited<ReturnType<typeof SiteOptions.exclusiveProxyPrice.get>>;
};

export default function calculatePrice({
  hours,
  prices,
  proxyType,
}: {
  hours: number;
  prices: Prices;
  proxyType: string;
}): number {
  if (hours >= 24 * 30) {
    const month = Math.floor(hours / (24 * 30));
    const remainingHours = hours % (24 * 30);

    return (
      month *
        (proxyType === "shared"
          ? prices.shared.month
          : prices.exclusive.month) +
      calculatePrice({ hours: remainingHours, prices, proxyType })
    );
  }

  if (hours >= 24 * 7) {
    const week = Math.floor(hours / (24 * 7));
    const remainingHours = hours % (24 * 7);

    return (
      week *
        (proxyType === "shared" ? prices.shared.week : prices.exclusive.week) +
      calculatePrice({ hours: remainingHours, prices, proxyType })
    );
  }

  if (hours >= 24) {
    const day = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return (
      day *
        (proxyType === "shared" ? prices.shared.day : prices.exclusive.day) +
      calculatePrice({ hours: remainingHours, prices, proxyType })
    );
  }

  return (
    hours *
    (proxyType === "shared" ? prices.shared.hour : prices.exclusive.hour)
  );
}
