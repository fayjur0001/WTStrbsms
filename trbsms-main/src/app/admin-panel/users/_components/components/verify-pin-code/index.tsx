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
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, RectangleEllipsis } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import schema from "./schemas/code.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import checkPinCodeAction from "./actions/check-pin-code.action";
import { cn } from "@/lib/utils";

export default function VerifyPinCode({
  id,
  username,
}: {
  id: number;
  username: string;
}) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const form = useForm({
    defaultValues: {
      code: "",
      id,
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    form.reset();
  }, [form, open]);

  useEffect(() => {
    setSuccess(false);
  }, [open]);

  const mutation = useMutation({
    mutationFn: checkPinCodeAction,
    onSuccess: (r) => {
      if (r.success) setSuccess(true);
      else if (!!r.field) form.setError(r.field, { message: r.message });
      else toast.error(r.message);
    },
  });

  const submit = form.handleSubmit((data) => {
    if (mutation.isPending) return;

    mutation.mutate(data);
  });

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Check {username}
              {"'"}s pin code
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Please fill the pin code {username} has provided you and click
            check.
          </DialogDescription>
          <Form {...form}>
            <form onSubmit={submit}>
              <div className="px-6">
                <FormField
                  control={form.control}
                  name="id"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => {
                    const successMessage = `Yes ${username} has provided the correct pin code. You may take necessary actions.`;
                    return (
                      <FormItem>
                        <FormLabel>Pin code</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                        {success && (
                          <p className="text-sm">
                            <span
                              className={cn(
                                "absolute",
                                "mx-auto",
                                "py-4",
                                "flex",
                                "border",
                                "w-fit",
                                "bg-gradient-to-r",
                                "blur-xl",
                                "from-[#a2682a]",
                                "via-[#be8c3c]",
                                "via-[#d3b15f]",
                                "via-[#faf0a0]",
                                "via-[#ffffc2]",
                                "via-[#faf0a0]",
                                "via-[#d3b15f]",
                                "via-[#be8c3c]",
                                "via-[#b17b32]",
                                "via-[#d4a245]",
                                "via-[#e1b453]",
                                "to-[#a4692a]",
                                "bg-clip-text",
                                "text-sm",
                                "box-content",
                                "text-transparent",
                                "select-none",
                              )}
                            >
                              {successMessage}
                            </span>
                            <h1
                              className={cn(
                                "relative",
                                "top-0",
                                "w-fit",
                                "h-auto",
                                "py-4",
                                "justify-center",
                                "flex",
                                "bg-gradient-to-r",
                                "items-center",
                                "from-[#a2682a]",
                                "via-[#be8c3c]",
                                "via-[#d3b15f]",
                                "via-[#faf0a0]",
                                "via-[#ffffc2]",
                                "via-[#faf0a0]",
                                "via-[#d3b15f]",
                                "via-[#be8c3c]",
                                "via-[#b17b32]",
                                "via-[#d4a245]",
                                "via-[#e1b453]",
                                "to-[#a4692a]",
                                "bg-clip-text",
                                "text-sm",
                                "text-transparent",
                                "select-auto",
                              )}
                            >
                              {successMessage}
                            </h1>
                          </p>
                        )}
                      </FormItem>
                    );
                  }}
                />
              </div>
              <DialogFooter>
                <Button>
                  {mutation.isPending && (
                    <LoaderCircle className="animate-spin" />
                  )}{" "}
                  Check
                </Button>
                <DialogClose asChild>
                  <Button variant={"secondary"} type="button">
                    {success ? "Close" : "Cancel"}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={"icon"}
            className="rounded-full bg-background-dark"
            onClick={() => setOpen(true)}
          >
            <RectangleEllipsis />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Check {username}
            {"'"}s pin code
          </p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
