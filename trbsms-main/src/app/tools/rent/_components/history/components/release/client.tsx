"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Ban } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import canReleaseAction from "./actions/can-release.action";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import releaseAction from "./actions/release.action";
import useRefresh from "@/hooks/use-refresh";

export default function Release({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const { canRelease } = useCanRelease(id);

  const mutation = useMutation({
    mutationFn: releaseAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("MDN released successfully.");
        setOpen(false);
      } else toast.error(r.message);
    },
  });

  if (!canRelease) return null;

  function release() {
    if (mutation.isPending) return;

    mutation.mutate(id);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            <Ban />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Release MDN</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to release this MDN?
          </DialogDescription>
          <DialogFooter>
            <Button onClick={release}>Confirm</Button>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function useCanRelease(id: number) {
  const [canRelease, setCanRelease] = useState(false);

  const query = useQuery({
    queryKey: ["tools", "rent", "history", "can-release", id],
    queryFn: () => canReleaseAction(id),
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      setCanRelease(query.data.canRelease);
    } else toast.error(query.data.message);
  }, [query.data]);

  useRefresh(`/tools/rent/history/can-release/${id}`, query.refetch);

  return {
    canRelease,
  };
}
