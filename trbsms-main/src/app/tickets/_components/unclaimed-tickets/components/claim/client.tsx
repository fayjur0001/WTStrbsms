import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import claimAction from "./actions/claim.action";

export default function Claim({ ticketId }: { ticketId: number }) {
  const claimMutation = useMutation({
    mutationFn: () => claimAction(ticketId),
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Ticket claimed successfully.");
      } else {
        toast.error(r.message);
      }
    },
  });

  function claim() {
    if (claimMutation.isPending) return;

    claimMutation.mutate();
  }

  return (
    <Button size={"sm"} onClick={claim}>
      {claimMutation.isPending && <LoaderCircle className="animate-spin" />}
      Claim
    </Button>
  );
}
