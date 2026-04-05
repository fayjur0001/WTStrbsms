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
  DialogTrigger,
} from "@/components/ui/dialog";
import toggleTicketStatusAction from "./actions/toggle-ticket-status.action";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Status } from "../actions/get-ticket-status.action";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ToggleTicketStatus({
  ticketId,
  currentUserId,
  userId,
  agentId,
  status,
}: {
  ticketId: number;
  currentUserId: number;
  userId: number;
  agentId: number | null;
  status: Status;
}) {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  function back() {
    router.back();
  }

  const toggleTicketStatusMutation = useMutation({
    mutationFn: () => toggleTicketStatusAction(ticketId),
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Ticket status has been changed successfully.");
        setOpen(false);
        if (status === "opened") back();
      } else toast.error(r.message);
    },
  });

  function toggleTicketStatus() {
    if (toggleTicketStatusMutation.isPending) return;

    toggleTicketStatusMutation.mutate();
  }

  return (
    ((userId === currentUserId && status === "opened") ||
      agentId === currentUserId) && (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="bg-primary-dark hover:bg-primary-dark/70"
          >
            {status === "opened" ? "Close" : "Reopen"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm {status === "opened" ? "closing" : "reopening"} ticket
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="px-6">
            {status === "opened"
              ? userId === currentUserId
                ? "After this operation you can't answer here."
                : "After this operation neither of you can answer here."
              : "After this operation other party will be able to answer here."}
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant={"outline"}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={toggleTicketStatus}>
              {toggleTicketStatusMutation.isPending && (
                <LoaderCircle className="animate-spin" />
              )}{" "}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  );
}
