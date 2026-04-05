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
import schema from "./schemas/jabber.schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import changeJabberAction from "./actions/jabber.action";
import { LoaderCircle } from "lucide-react";

export default function Jabber({ jabber }: { jabber: string }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { jabber },
  });

  const submitMutation = useMutation({
    mutationFn: changeJabberAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Jabber changed.");
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
          name="jabber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jabber</FormLabel>
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
