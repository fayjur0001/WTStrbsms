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
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import redialProxyPortAction from "./actions/redial-proxy-port.action";

export default function Redial({ id }: { id: number }) {
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: redialProxyPortAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Successfully redial proxy port");
        setOpen(false);
      } else toast.error(r.message);
    },
  });

  function click() {
    if (mutation.isPending) return;

    mutation.mutate(id);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={"icon"}
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            <RotateCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redial Proxy Port</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to redial this proxy port?
          </DialogDescription>
          <DialogFooter>
            <Button onClick={click}>Confirm</Button>
            <DialogClose asChild>
              <Button variant={"secondary"}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
