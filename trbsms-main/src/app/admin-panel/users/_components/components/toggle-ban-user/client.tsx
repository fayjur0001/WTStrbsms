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
import { Ban, LoaderCircle, Undo } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import toggleBanUserAction from "./actions/toggle-ban-user.action";

export default function ToggleBanUser({
  id,
  username,
  banned,
}: {
  id: number;
  username: string;
  banned: boolean;
}) {
  const [open, setOpen] = useState(false);

  const toggleBanMutation = useMutation({
    mutationFn: toggleBanUserAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(`${username} has been permanently banned.`);
        setOpen(false);
      } else {
        toast.error(r.message);
      }
    },
  });

  function onClick() {
    if (toggleBanMutation.isPending) return;

    toggleBanMutation.mutate(id);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="bg-background-dark rounded-full"
            type="button"
            size="icon"
            onClick={() => setOpen((v) => !v)}
          >
            {banned ? <Undo /> : <Ban />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {banned ? "Unban" : "Ban"} {username}?
          </p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {banned ? "Unban" : "Ban"} {username}?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to {banned ? "unban" : "ban"} this user?
          </DialogDescription>
          <DialogFooter>
            <Button onClick={onClick}>
              {toggleBanMutation.isPending && (
                <LoaderCircle className="animate-spin" />
              )}
              Confirm
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
