import { Button } from "@/components/ui/button";
import { DollarSign, LoaderCircle } from "lucide-react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import usePrice from "../hooks/get-price.hook";
import SiteOptions from "@/lib/utils/site-options";
import { DialogClose } from "@radix-ui/react-dialog";
import getSchema from "../schemas/get-filter.schema";

type Prices = {
  shared: Awaited<ReturnType<typeof SiteOptions.sharedProxyPrice.get>>;
  exclusive: Awaited<ReturnType<typeof SiteOptions.exclusiveProxyPrice.get>>;
};

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Rent({
  form,
  port,
  prices,
  adminCut,
  purchase,
  isLoading,
}: {
  form: UseFormReturn<z.infer<ReturnType<typeof getSchema>>>;
  port: string;
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
  isLoading: boolean;
  purchase: () => void;
}) {
  const [open, setOpen] = useState(false);

  const price = usePrice({
    prices,
    proxyType: form.watch("proxyType"),
    unit: form.watch("unit"),
    unitType: form.watch("unitType"),
    adminCut,
  });

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={"icon"}
            className="rounded-full bg-background"
            type="button"
            onClick={() => {
              form.setValue("port", port);
              setOpen(true);
            }}
          >
            <DollarSign />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Rent this proxy</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to buy this proxy? this will cost you $
            {formatter.format(price())}
          </DialogDescription>
          <DialogFooter>
            <Button onClick={purchase}>
              {isLoading && <LoaderCircle className="animate-spin" />}
              Confirm
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant={"secondary"}
                onClick={() => form.setValue("port", "")}
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
