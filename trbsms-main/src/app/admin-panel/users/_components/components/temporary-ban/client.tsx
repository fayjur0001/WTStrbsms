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
import { useState } from "react";
import { toast } from "sonner";
import temporaryBanAction from "./actions/temporary-ban.action";
import { LoaderCircle } from "lucide-react";

export default function TemporaryBan({
  id,
  username,
}: {
  id: number;
  username: string;
}) {
  const [open, setOpen] = useState(false);

  const temporaryBanMutation = useMutation({
    mutationFn: temporaryBanAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(`${username} has been banned for 7 days.`);
        setOpen(false);
      } else toast.error(r.message);
    },
  });

  function onClick() {
    if (temporaryBanMutation.isPending) return;

    temporaryBanMutation.mutate(id);
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
            7
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ban {username} for 7 days?</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban {username} for 7 days?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to ban this user for 7 days?
          </DialogDescription>
          <DialogFooter>
            <Button type="button" onClick={onClick}>
              {temporaryBanMutation.isPending && (
                <LoaderCircle className="animate-spin" />
              )}
              Confirm
            </Button>
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
