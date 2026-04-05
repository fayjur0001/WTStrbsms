import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import titlecase from "@/lib/utils/titlecase";
import { Input } from "@/components/ui/input";
import getSchema from "../schemas/get-filter.schema";

type Control = UseFormReturn<z.infer<ReturnType<typeof getSchema>>>["control"];

export default function Filter({
  control,
  unitType,
  unitTypeEnumArray,
  proxyTypeEnumArray,
  services,
}: {
  control: Control;
  unitType: string;
  unitTypeEnumArray: [string, ...string[]];
  proxyTypeEnumArray: [string, ...string[]];
  services: [string, ...string[]];
}) {
  return (
    <div className="flex gap-2">
      <Services control={control} services={services} />
      <ProxyType control={control} proxyTypeEnumArray={proxyTypeEnumArray} />
      <UnitType control={control} unitTypeEnumArray={unitTypeEnumArray} />
      <Unit unitType={unitType} control={control} />
    </div>
  );
}

function Services({
  control,
  services,
}: {
  services: [string, ...string[]];
  control: Control;
}) {
  return (
    <FormField
      control={control}
      name="service"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service</FormLabel>
          <FormControl>
            <Select {...field} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {titlecase(service)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function ProxyType({
  control,
  proxyTypeEnumArray,
}: {
  control: Control;
  proxyTypeEnumArray: [string, ...string[]];
}) {
  return (
    <FormField
      control={control}
      name="proxyType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Proxy type</FormLabel>
          <FormControl>
            <Select {...field} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a proxy type" />
              </SelectTrigger>
              <SelectContent>
                {proxyTypeEnumArray.map((proxyType) => (
                  <SelectItem key={proxyType} value={proxyType}>
                    {titlecase(proxyType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function UnitType({
  control,
  unitTypeEnumArray,
}: {
  control: Control;
  unitTypeEnumArray: [string, ...string[]];
}) {
  return (
    <FormField
      control={control}
      name="unitType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Unit</FormLabel>
          <FormControl>
            <Select {...field} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {unitTypeEnumArray.map((unitType) => (
                  <SelectItem key={unitType} value={unitType}>
                    {titlecase(unitType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function Unit({ control, unitType }: { control: Control; unitType: string }) {
  return (
    <FormField
      control={control}
      name="unit"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{titlecase(unitType)}</FormLabel>
          <FormControl>
            <Input {...field} type="number" step={1} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
