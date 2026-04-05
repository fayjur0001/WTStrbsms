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
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import changeUsernameAction from "./actions/change-username.action";
import schema from "./schemas/change-username.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

export default function Username({ username }: { username: string }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username,
    },
  });

  const submitMutation = useMutation({
    mutationFn: changeUsernameAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Username updated successfully");
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
          name="username"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    {...field}
                    placeholder="Stevenson"
                    className="bg-background"
                  />
                  <Button>
                    {submitMutation.isPending && (
                      <LoaderCircle className="animate-spin" />
                    )}
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
