"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import schema from "./schemas/telegram.schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import changeTelegramAction from "./actions/telegram.action";
import { LoaderCircle } from "lucide-react";

export default function Telegram({ telegram }: { telegram: string }) {
  const form = useForm({
    defaultValues: {
      telegram,
    },
    resolver: zodResolver(schema),
  });

  const submitMutation = useMutation({
    mutationFn: changeTelegramAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Telegram changed successfully.");
      } else {
        toast.error(r.message);
      }
    },
  });

  const submit = form.handleSubmit((data) => {
    if (submitMutation.isPending) {
      return;
    }

    submitMutation.mutate(data);
  });

  return (
    <form onSubmit={submit}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="telegram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telegram</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input {...field} className="bg-background" />
                  <Button>
                    {submitMutation.isPending && (
                      <LoaderCircle className="animate-spin" />
                    )}{" "}
                    Save
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </form>
  );
}
