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
import { useMutation } from "@tanstack/react-query";
import { Ban } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import rejectAction from "./actions/reject.action";

export default function Reject({ id }: { id: number }) {
  const [open, setOpen] = useState(false);

  const rejectMutation = useMutation({
    mutationFn: rejectAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Service rejected successfully.");
        setOpen(false);
      } else toast.error(r.message);
    },
  });

  function onClick() {
    if (rejectMutation.isPending) return;

    rejectMutation.mutate(id);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"ghost"}
            size="icon"
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            <Ban />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reject Service</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to reject this service?
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
