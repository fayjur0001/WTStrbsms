"use client";

import { Button } from "@/components/ui/button";
import Card from "../../card";
import { Control, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import getSchema from "./schemas/generate.schema";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import getCryptoOptionsAction from "./actions/get-crypto-options.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import generateAction from "./actions/generate.action";
import useRefresh from "@/hooks/use-refresh";

export default function Generate() {
  const { cryptos, isLoading } = useCryptoOptions();

  const schema = getSchema(cryptos as [string, ...string[]]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      crypto: "",
      // @ts-expect-error aaa
      amount: "",
    },
  });

  const mutation = useMutation({
    mutationFn: generateAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(`${form.getValues("crypto")} address generated.`);
        form.reset();
      } else toast.error(r.message);
    },
  });

  const submit = form.handleSubmit((data) => {
    if (mutation.isPending) return;

    mutation.mutate(data);
  });

  return isLoading ? (
    <Loading />
  ) : (
    !!cryptos.length && (
      <Card className="flex-1 flex items-center justify-center">
        <form className="space-y-2" onSubmit={submit}>
          <Form {...form}>
            <SelectCrypto control={form.control} options={cryptos} />
            <Amount control={form.control} />
            <Button className="w-full">
              {mutation.isPending && <LoaderCircle className="animate-spin" />}
              Generate
            </Button>
          </Form>
        </form>
      </Card>
    )
  );
}

function Loading() {
  return (
    <Card className="flex-1 flex items-center justify-center">
      <div className="w-1/2 space-y-2">
        <div className="loading h-10" />
        <div className="loading h-10" />
        <div className="loading h-10" />
      </div>
    </Card>
  );
}

function SelectCrypto({
  control,
  options,
}: {
  control: Control<z.infer<ReturnType<typeof getSchema>>>;
  options: string[];
}) {
  return (
    <FormField
      control={control}
      name="crypto"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Currency</FormLabel>
          <FormControl>
            <Select {...field} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a crypto" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
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

function Amount({
  control,
}: {
  control: Control<z.infer<ReturnType<typeof getSchema>>>;
}) {
  return (
    <FormField
      control={control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <FormControl>
            <Input {...field} type="number" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function useCryptoOptions(): { cryptos: string[]; isLoading: boolean } {
  const [cryptos, setCryptos] = useState<string[]>([]);

  const query = useQuery({
    queryKey: ["add-balance", "now-payments", "generate", "options"],
    queryFn: getCryptoOptionsAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setCryptos(query.data.cryptos);
    else toast.error(query.data.message);
  }, [query.data]);

  useRefresh("/add-balance/now-payments/generate", () => query.refetch);

  return { cryptos, isLoading: query.isLoading };
}
