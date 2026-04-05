"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import servicesAction from "../../../services/actions/get-services.action";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import schema from "./schemas/renew.schems";
import { z } from "zod";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import renewAction from "./actions/renew.action";

const formatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Renew({
  id,
  service,
}: {
  id: number;
  service: string;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: { id, rentType: "short" },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [form, open]);

  const { price } = usePrice(service, form.watch("rentType"));

  const mutation = useMutation({
    mutationFn: renewAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Successfully renewed");
        setOpen(false);
      } else toast.error(r.message);
    },
  });

  const submit = form.handleSubmit((data) => {
    if (mutation.isPending) return;

    mutation.mutate(data);
  });

  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-full"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <RefreshCw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Renew</TooltipContent>
      </Tooltip>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm?</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit}>
            <div className="px-4">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="rentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Type</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          {...field}
                          onValueChange={field.onChange}
                        >
                          <ToggleGroupItem value="short">
                            3 Days
                          </ToggleGroupItem>
                          <ToggleGroupItem value="regular">
                            30 Days
                          </ToggleGroupItem>
                          <ToggleGroupItem value="unlimited">
                            Unlimited
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </div>
            <DialogDescription>
              Are you sure you want to renew? This will cost ${" "}
              {formatter.format(price)}.
            </DialogDescription>
            <DialogFooter>
              <Button>
                {mutation.isPending && (
                  <LoaderCircle className="animate-spin" />
                )}
                Confirm
              </Button>
              <DialogClose asChild>
                <Button type="button" variant={"secondary"}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function usePrice(
  service: string,
  rentType: z.infer<typeof schema>["rentType"],
): { price: number } {
  const [price, setPrice] = useState(0);

  const query = useQuery({
    queryKey: ["/tools/rent/history/price"],
    queryFn: servicesAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      const fService = query.data.services.find((s) => s.name === service);
      let price =
        (rentType === "short" ? fService?.shortPrice : fService?.price) || 0;

      if (rentType === "unlimited") price += 5;

      const cut =
        rentType === "short"
          ? query.data.adminCut.short
          : rentType === "regular"
            ? query.data.adminCut.regular
            : query.data.adminCut.unlimited;

      setPrice(price + (price * cut) / 100);
    } else toast.error(query.data.message);
  }, [query.data, rentType, service]);

  return { price };
}
