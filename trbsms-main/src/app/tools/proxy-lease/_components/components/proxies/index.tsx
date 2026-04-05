"use client";

import { useForm } from "react-hook-form";
import Filter from "./components/filter";
import { CSSProperties, useEffect, useState } from "react";
import SiteOptions from "@/lib/utils/site-options";
import useProxies from "./hooks/get-proxies.hook";
import Loading from "./components/loading";
import THead from "./components/thead";
import Rent from "./components/rent";
import usePrice from "./hooks/get-price.hook";
import getSchema from "./schemas/get-filter.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import rentProxyAction from "./actions/rent-proxy.action";
import { Form } from "@/components/ui/form";

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Prices = {
  shared: Awaited<ReturnType<typeof SiteOptions.sharedProxyPrice.get>>;
  exclusive: Awaited<ReturnType<typeof SiteOptions.exclusiveProxyPrice.get>>;
};

export default function Proxies({
  prices,
  adminCut,
  unitTypeEnumArray,
  proxyTypeEnumArray,
  services,
}: {
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
  unitTypeEnumArray: [string, ...string[]];
  proxyTypeEnumArray: [string, ...string[]];
  services: [string, ...string[]];
}) {
  const schema = getSchema({
    proxyTypeEnumArray,
    serviceEnumArray: services,
    unitTypeEnumArray,
  });

  const form = useForm({
    defaultValues: {
      service: services.at(0) || "",
      unit: 1,
      unitType: "hour",
      proxyType: "shared",
      port: "",
    },
    resolver: zodResolver(schema),
  });

  const purchaseMutation = useMutation({
    mutationFn: rentProxyAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Successfully rented proxy");
        form.reset();
      } else toast.error(r.message);
    },
  });

  const purchase = form.handleSubmit((data) => {
    if (purchaseMutation.isPending) return;

    purchaseMutation.mutate(data);
  });

  const price = usePrice({
    unit: form.watch("unit"),
    unitType: form.watch("unitType"),
    prices,
    proxyType: form.watch("proxyType"),
    adminCut,
  });

  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref) return;

    const observer = new ResizeObserver((entries) => {
      setHeight(entries.at(0)?.target.clientHeight || 0);
    });

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref]);

  const { isLoading, proxies } = useProxies(form.watch("proxyType"));

  return (
    <form className="h-full p-4 bg-background-dark rounded-md">
      <Form {...form}>
        <div className="h-full">
          <div ref={setRef}>
            <div className="flex gap-2 items-end">
              <Filter
                control={form.control}
                unitTypeEnumArray={unitTypeEnumArray}
                unitType={form.watch("unitType") || ""}
                proxyTypeEnumArray={proxyTypeEnumArray}
                services={services}
              />
              <div className="py-2">
                Your proxy will cost $ {formatter.format(price())}
              </div>
            </div>
            <div className="h-4" />
          </div>
          <div
            className="overflow-y-auto h-[calc(100%_-_var(--height))]"
            style={{ "--height": `${height}px` } as CSSProperties}
          >
            {isLoading ? (
              <Loading />
            ) : (
              <table className="table">
                <THead />
                <tbody>
                  {proxies.map((proxy) => (
                    <tr key={proxy.port}>
                      <td className="text-center">{proxy.port}</td>
                      <td className="text-center">{proxy.location}</td>
                      <td className="text-center">{proxy.carrier}</td>
                      <td className="text-center">{proxy.redialInterval}</td>
                      <td className="text-center">{proxy.leases}</td>
                      <td className="text-center">{proxy.services}</td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <Rent
                            purchase={purchase}
                            adminCut={adminCut}
                            prices={prices}
                            form={form}
                            port={proxy.port}
                            isLoading={purchaseMutation.isPending}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Form>
    </form>
  );
}
