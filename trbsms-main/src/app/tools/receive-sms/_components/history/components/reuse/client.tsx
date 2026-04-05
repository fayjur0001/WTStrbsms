"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import reuseAction from "./actions/reuse.action";

export default function Reuse({ id, price }: { id: number; price: number }) {
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: reuseAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("MdN re-used successfully.");
        setOpen(false);
      } else {
        toast.error(r.message);
      }
    },
  });

  function onClick() {
    if (mutation.isPending) return;

    mutation.mutate(id);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            <RefreshCw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reuse this mdn</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to reuse this mdn? this will cost you $
            {price.toFixed(2)}.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={onClick}>Confirm</Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
