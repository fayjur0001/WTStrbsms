import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import rentAction from "./actions/rent.action";
import { toast } from "sonner";
import { useState } from "react";

export default function RentService({
  name,
  available,
  price,
}: {
  name: string;
  available: string;
  price: number;
}) {
  const [open, setOpen] = useState(false);

  const rentMutation = useMutation({
    mutationFn: rentAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Service rented successfully.");
        setOpen(false);
      } else toast.error(r.message);
    },
  });

  function rent() {
    if (rentMutation.isPending) return;

    rentMutation.mutate(name);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex justify-between bg-primary rounded-full py-2 px-4 text-sm cursor-pointer shadow-md hover:bg-primary-dark transition duration-250">
          <span>{name}</span>
          <span>
            {available ? `${available} - ` : ""}${price.toFixed(2)}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to buy this service? This will cost you $
          {price.toFixed(2)}.
        </DialogDescription>
        <DialogFooter>
          <Button onClick={rent}>Confirm</Button>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
