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
import { ZoomIn } from "lucide-react";
import { useState } from "react";
import Messages from "./components/messages/client";

export default function ViewSms({ id }: { id: number }) {
  const [open, setOpen] = useState(false);

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
            <ZoomIn />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View SMS</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] md:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>SMS</DialogTitle>
          </DialogHeader>
          <DialogDescription className="hidden">List of sms</DialogDescription>
          <Messages id={id} />
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
