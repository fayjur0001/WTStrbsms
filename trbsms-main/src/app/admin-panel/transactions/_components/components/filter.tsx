import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import getFilterSchema from "../schemas/filter.schema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

export default function Filter({
  form,
  walletNames,
  reset,
  isLoading,
}: {
  form: UseFormReturn<z.infer<ReturnType<typeof getFilterSchema>>>;
  walletNames: [string, ...string[]];
  reset: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-end gap-4">
      <Form {...form}>
        <FormField
          control={form.control}
          name="txid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TXID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="walletName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wallet Name</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={String(field.value)}
                  name={field.name}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Wallet Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {walletNames
                        .map((r) => ({ value: r, name: r }))
                        .map(({ value, name }) => (
                          <SelectItem key={value} value={String(value)}>
                            {name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </Form>
      <Button variant={"secondary"}>
        {isLoading && <LoaderCircle className="animate-spin" />}Search
      </Button>
      <Button type="button" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}
