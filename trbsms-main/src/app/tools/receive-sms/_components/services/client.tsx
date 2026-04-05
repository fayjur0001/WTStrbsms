"use client";

import { /*ReactNode, */ useCallback, useEffect, useState } from "react";
import getServicesAction from "./actions/get-services.action";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm, UseFormReturn } from "react-hook-form";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import RentService from "./components/rent-service/client";

type Service = Extract<
  Awaited<ReturnType<typeof getServicesAction>>,
  { success: true }
>["services"][0];

const schema = z.object({
  search: z.string().optional().default(""),
});

export default function Client() {
  const { services, isLoading, cut } = useServices();

  const form = useForm({
    defaultValues: { search: "" },
    resolver: zodResolver(schema),
  });

  const searchString = form.watch("search");

  const filteredServices = useCallback((): Service[] => {
    if (!Array.isArray(services)) return [];
    return services
      .filter((service) =>
        new RegExp(searchString || "", "i").test(service.name.toLowerCase()),
      )
      .toSorted((a, b) => (Number(a.available) < Number(b.available) ? 1 : -1));
  }, [searchString, services]);

  const [filterHeight, setFilterHeight] = useState(0);

  const filterRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    setFilterHeight(node.offsetHeight);
  }, []);

  return (
    <div className="bg-background-dark rounded-md p-4 h-[calc(50%_-_--spacing(2))]">
      <div ref={filterRef}>
        <div className="flex items-center gap-2">
          <h1 className="text-lg text-primary font-bold">Select a Services</h1>
          <div className="flex-1">
            <Form {...form}>
              <Search serviceCount={services.length} control={form.control} />
            </Form>
          </div>
        </div>
        <div className="h-4" />
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-2 overflow-y-auto place-content-start"
          style={{
            height: `calc(100% - ${filterHeight}px)`,
          }}
        >
          {filteredServices().map((service) => (
            <RentService
              price={
                (Number(service.price) * cut) / 100 + Number(service.price)
              }
              key={service.name}
              name={service.name}
              available={service.available}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Search({
  control,
  serviceCount,
  // searchResults,
}: {
  control: UseFormReturn["control"];
  serviceCount: number;
  // searchResults: ReactNode;
}) {
  // const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="relative">
      <FormField
        control={control}
        name="search"
        render={({ field }) => (
          <FormItem>
            <Input
              type="search"
              {...field}
              placeholder={`Search from our ${serviceCount} services`}
              className="border-primary text-primary placeholder:text-primary rounded-full"
            // onFocus={() => setIsOpened(true)}
            // onBlur={() => setTimeout(() => setIsOpened(false), 300)}
            />
          </FormItem>
        )}
      />
      {/* {isOpened && ( */}
      {/*   <div className="absolute top-[calc(100%+10px)] bg-background w-full rounded-md shadow overflow-hidden"> */}
      {/*     {searchResults} */}
      {/*   </div> */}
      {/* )} */}
    </div>
  );
}

// function SearchResults({
//   filteredServices,
//   onClick: click,
// }: {
//   filteredServices: Service[];
//   onClick: (value: string) => void;
// }) {
//   return (
//     <div className="max-h-150 overflow-y-auto">
//       {filteredServices.map((service) => (
//         <button
//           className="block hover:bg-background-dark cursor-pointer w-full text-left px-4 py-2"
//           key={service.name}
//           onClick={() => click(service.name)}
//         >
//           {service.name}
//         </button>
//       ))}
//     </div>
//   );
// }

function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [cut, setCut] = useState(0);

  const query = useQuery({
    queryKey: ["tools", "receive-sms", "services"],
    queryFn: getServicesAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      setServices(query.data.services);
      setCut(query.data.cut);
    } else toast.error(query.data.message);
  }, [query.data]);

  return { services, isLoading: query.isLoading || query.isFetching, cut };
}

function Loading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Array(16)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="loading h-10 rounded-full" />
        ))}
    </div>
  );
}
