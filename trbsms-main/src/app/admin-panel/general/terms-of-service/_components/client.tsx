"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import schema from "./schemas/tos.schema";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import setTOSAction from "./actions/set-tos.action";
import { zodResolver } from "@hookform/resolvers/zod";
import markdown from "markdown-it";
import { LoaderCircle } from "lucide-react";

const md = markdown();

export default function Client({
  defaultValues,
}: {
  defaultValues: z.infer<typeof schema>;
}) {
  const form = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: setTOSAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Terms of Service updated successfully!");
      } else toast.error(r.message);
    },
  });

  const submit = form.handleSubmit((data) => {
    if (mutation.isPending) return;

    mutation.mutate(data);
  });

  const tos = form.watch("tos");

  return (
    <div className="flex gap-4 p-4">
      <form className="space-y-4 flex-1" onSubmit={submit}>
        <Form {...form}>
          <FormField
            control={form.control}
            name="tos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms of Service</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        <div className="flex justify-end items-center">
          <Button>
            {mutation.isPending && <LoaderCircle className="animate-spin" />}
            Save
          </Button>
        </div>
      </form>
      <div
        className="prose-sm prose-ul:list-disc prose-ol:list-decimal prose-headings:text-primary prose-a:text-primary prose-a:underline flex-1"
        dangerouslySetInnerHTML={{ __html: md.render(tos) }}
      />
    </div>
  );
}
