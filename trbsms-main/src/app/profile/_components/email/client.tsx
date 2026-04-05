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
import { z } from "zod";
import schema from "./schemas/change-email.schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import updateEmailAction from "./actions/update-email.action";
import { LoaderCircle } from "lucide-react";

export default function Email({ email }: { email: string }) {
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: { email },
    resolver: zodResolver(schema),
  });

  const submitMutation = useMutation({
    mutationFn: updateEmailAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Email updateded successfully.");
      } else {
        toast.error(r.message);
      }
    },
  });

  const submit = form.handleSubmit((data) => {
    if (submitMutation.isPending) return;

    submitMutation.mutate(data);
  });

  return (
    <form onSubmit={submit}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input {...field} className="bg-background" />
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
