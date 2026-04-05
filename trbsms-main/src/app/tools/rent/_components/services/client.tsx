"use client";

import { useCallback, useEffect, useState } from "react";
import getServicesAction from "./actions/get-services.action";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Service, { RentType } from "./components/service/client";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import Loading from "./components/loading";
import Filter from "./components/filter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TService = Extract<
  Awaited<ReturnType<typeof getServicesAction>>,
  { success: true }
>["services"][number];

const schema = z.object({
  name: z.string().optional().default(""),
});

export default function Services() {
  const [rentType, setRentType] = useState<RentType>("short");
  const { services, isLoading, adminCut } = useServices(rentType);

  const form = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(schema),
  });

  const name = form.watch("name");

  const filteredServices = useCallback((): TService[] => {
    return services
      .filter((service) => new RegExp(name || "", "i").test(service.name))
      .toSorted((a, b) => (a.available < b.available ? 1 : -1));
  }, [name, services]);

  const [filterHeight, setFilterHeight] = useState(0);

  const filterRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    setFilterHeight(node.clientHeight);
  }, []);

  const [rentTypeHeight, setRentTypeHeight] = useState(0);

  const rentTypeRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    setRentTypeHeight(node.clientHeight);
  }, []);

  return (
    <div className="bg-background-dark p-4 rounded-md h-[calc(50%_-_--spacing(2))]">
      <Form {...form}>
        <div ref={filterRef}>
          <form className="flex gap-2 items-center">
            <span className="text-primary font-bold text-xl">
              Select a service
            </span>
            <div className="flex-1">
              <Filter control={form.control} serviceCount={services.length} />
            </div>
          </form>
          <div className="h-4" />
        </div>
      </Form>
      <div ref={rentTypeRef}>
        <ToggleGroup
          type="single"
          variant={"outline"}
          value={rentType}
          onValueChange={(value: string) => setRentType(value as RentType)}
        >
          <ToggleGroupItem value="short">3 days</ToggleGroupItem>
          <ToggleGroupItem value="regular">30 days</ToggleGroupItem>
          <ToggleGroupItem value="unlimited">Unlimited</ToggleGroupItem>
        </ToggleGroup>
        <div className="h-4" />
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <div
          className="grid gap-2 grid-cols-2 md:grid-cols-4 overflow-y-auto place-content-start"
          style={{
            height: `calc(100% - ${filterHeight}px - ${rentTypeHeight}px)`,
          }}
        >
          {filteredServices().map((service) => {
            let price =
              rentType === "short" ? service.shortPrice : service.price;

            if (rentType === "unlimited") price += 5;

            price = price + (price * adminCut) / 100;

            return (
              <Service
                name={service.name}
                key={service.name}
                available={service.available}
                price={price}
                rentType={rentType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function useServices(rentType: RentType) {
  const [services, setServices] = useState<TService[]>([]);
  const [adminCut, setAdminCut] = useState(0);

  const query = useQuery({
    queryKey: ["tools", "rent", "services"],
    queryFn: getServicesAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      setServices(query.data.services);

      const cut =
        rentType === "short"
          ? query.data.adminCut.short
          : rentType === "regular"
            ? query.data.adminCut.regular
            : query.data.adminCut.unlimited;

      setAdminCut(cut);
    } else toast.error(query.data.message);
  }, [query.data, rentType]);

  return { services, isLoading: query.isLoading || query.isFetching, adminCut };
}
