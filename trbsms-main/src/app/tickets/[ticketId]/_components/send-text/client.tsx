import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { LoaderCircle, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import sendTextSchema from "./schemas/send-text.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import sendTextAction from "./actions/send-text.action";
import { Status } from "../actions/get-ticket-status.action";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

export default function SendText({
  ticketId,
  currentUserId,
  userId,
  agentId,
  status,
  onHeightChange,
}: {
  ticketId: number;
  currentUserId: number;
  userId: number;
  agentId: number | null;
  status: Status;
  onHeightChange: (height: number) => void;
}) {
  const form = useForm<z.infer<typeof sendTextSchema>>({
    defaultValues: {
      text: "",
      ticketId,
    },
    resolver: zodResolver(sendTextSchema),
  });

  const sendTextMutation = useMutation({
    mutationFn: sendTextAction,
    onSuccess: (r) => {
      if (r.success) form.reset();
      else toast.error(r.message);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (sendTextMutation.isPending) return;

    sendTextMutation.mutate(data);
  });

  const [formElement, setFormElement] = useState<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!formElement) return;
    const observer = new ResizeObserver((entries) => {
      onHeightChange(entries.at(0)?.target.clientHeight || 0);
    });

    observer.observe(formElement);

    return () => observer.disconnect();
  }, [formElement, onHeightChange]);

  return (
    status === "opened" &&
    [userId, agentId].includes(currentUserId) && (
      <form
        className="flex gap-3 bg-background p-2 rounded-lg"
        onSubmit={onSubmit}
        ref={setFormElement}
      >
        <Form {...form}>
          <FormField
            name="text"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    rows={1}
                    {...field}
                    placeholder="Enter your Message"
                    className="bg-background-dark border-0 resize-none min-h-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit();
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
        <Button>
          Send
          {sendTextMutation.isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Send />
          )}
        </Button>
      </form>
    )
  );
}
