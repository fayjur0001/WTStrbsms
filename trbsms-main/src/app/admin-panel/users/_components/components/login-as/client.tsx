import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import loginAsAction from "./actions/login-as.action";

export default function LoginAs({
  id,
  username,
}: {
  id: number;
  username: string;
}) {
  const mutation = useMutation({
    mutationFn: loginAsAction,
    onSuccess: (r) => {
      if (r.success) window.location.reload();
      else toast.error(r.message);
    },
  });

  function click() {
    if (mutation.isPending) return;

    mutation.mutate(id);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="rounded-full bg-background"
          size={"icon"}
          onClick={click}
        >
          <LogIn />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Login as {username}</p>
      </TooltipContent>
    </Tooltip>
  );
}
