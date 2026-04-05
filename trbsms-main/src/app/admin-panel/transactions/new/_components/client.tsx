"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import getNewTransactionSchema from "./schemas/get-new-transaction.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import newTransactionAction from "./actions/new-transaction.action";
import { LoaderCircle } from "lucide-react";

export default function Client({
  walletNames,
  users,
}: {
  walletNames: [string, ...string[]];
  users: { value: number; label: string }[];
}) {
  const schema = getNewTransactionSchema(walletNames);

  const router = useRouter();

  function back() {
    router.push("/admin-panel/transactions");
  }

  const newTransactionMutation = useMutation({
    mutationFn: newTransactionAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Transaction created successfully.");
        back();
      } else {
        toast.error(r.message);
      }
    },
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      // @ts-expect-error aaa
      userId: "",
      txid: "",
      walletAddress: "",
      currency: "",
      // @ts-expect-error aaa
      amount: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (newTransactionMutation.isPending) return;

    newTransactionMutation.mutate(data);
  });

  return (
    <form className="p-4 space-y-4" onSubmit={onSubmit}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={field.onChange}
                  value={String(field.value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a username" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(({ value, label }) => (
                      <SelectItem key={value} value={String(value)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="txid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TXID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="walletAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wallet Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wallet Name</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletNames
                      .map((a) => ({ label: a, value: a }))
                      .map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      <div className="flex items-center justify-end gap-2">
        <Button>
          {newTransactionMutation.isPending && (
            <LoaderCircle className="animate-spin" />
          )}
          Save
        </Button>
        <Button type="button" variant={"secondary"} onClick={back}>
          Back
        </Button>
      </div>
    </form>
  );
}
