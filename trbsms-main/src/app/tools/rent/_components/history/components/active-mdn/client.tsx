import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation } from "@tanstack/react-query";
import { SatelliteDish } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import activateAction from "./actions/activate.action";

export default function ActiveMdn({ id }: { id: number }) {
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: activateAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("MDN Activated Successfully");
        setOpen(false);
      } else toast.error(r.message);
    },
  });

  function activate() {
    if (mutation.isPending) return;

    mutation.mutate(id);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-full"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <SatelliteDish />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Activate MDN</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to activate this mdn?
          </DialogDescription>
          <DialogFooter>
            <Button onClick={activate}>Confirm</Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancle</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
