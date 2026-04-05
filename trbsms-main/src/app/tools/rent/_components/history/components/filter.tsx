"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import titlecase from "@/lib/utils/titlecase";
import { LoaderCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

export default function Filter({
  control,
  statusArray,
  onlineStatusArray,
  onReset: reset,
  isLoading,
}: {
  control: UseFormReturn["control"];
  statusArray: [string, ...string[]];
  onlineStatusArray: [string, ...string[]];
  onReset: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-end gap-2">
      <Service control={control} />
      <Mdn control={control} />
      <OnlineStatus control={control} array={onlineStatusArray} />
      <Status control={control} array={statusArray} />
      <Button variant={"secondary"} type="submit">
        {isLoading && <LoaderCircle className="animate-spin" />}
        Search
      </Button>
      <Button onClick={reset} type="button">
        Reset
      </Button>
    </div>
  );
}

function Status({
  control,
  array,
}: {
  control: UseFormReturn["control"];
  array: [string, ...string[]];
}) {
  return (
    <FormField
      name="status"
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <FormControl>
            <Select {...field} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {array.map((v) => (
                  <SelectItem key={v} value={v}>
                    {titlecase(v)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function OnlineStatus({
  control,
  array,
}: {
  control: UseFormReturn["control"];
  array: [string, ...string[]];
}) {
  return (
    <FormField
      name="onlineStatus"
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Online Status</FormLabel>
          <FormControl>
            <Select {...field} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select online status" />
              </SelectTrigger>
              <SelectContent>
                {array.map((v) => (
                  <SelectItem key={v} value={v}>
                    {titlecase(v)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Service({ control }: { control: UseFormReturn["control"] }) {
  return (
    <FormField
      name="service"
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Mdn({ control }: { control: UseFormReturn["control"] }) {
  return (
    <FormField
      name="mdn"
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>MDN</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
