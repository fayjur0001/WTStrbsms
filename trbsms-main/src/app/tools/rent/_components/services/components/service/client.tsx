"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import rentAction from "./actions/rent.action";
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
import { useState } from "react";

export type RentType = "short" | "regular" | "unlimited";

export default function Service({
  name,
  available,
  price,
  rentType,
}: {
  name: string;
  available: number;
  price: number;
  rentType: RentType;
}) {
  const [open, setOpen] = useState(false);

  const rentMutation = useMutation({
    mutationFn: rentAction,
    onSuccess: (r) => {
      if (r.success) {
        setOpen(false);
        toast.success("Successfully rented");
      } else toast.error(r.message);
    },
  });

  function rent() {
    if (rentMutation.isPending) return;

    rentMutation.mutate({
      name,
      rentType,
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="py-2 px-4 rounded-full flex items-center justify-between cursor-pointer bg-primary hover:bg-primary-dark transition duration-250"
      >
        <span>{name}</span>
        <span>
          {available !== undefined && available !== null ? `${available} - ` : ""}${price.toFixed(2)}
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to rent this service? This will cost you $
            {price.toFixed(2)}.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={rent}>Confirm</Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
