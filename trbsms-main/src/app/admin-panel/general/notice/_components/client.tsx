"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import markdown from "markdown-it";
import { zodResolver } from "@hookform/resolvers/zod";
import schema from "./schemas/notice.schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import saveNoticeAction from "./actions/save-notice.action";
import { LoaderCircle } from "lucide-react";

const md = markdown();

export default function Client({ notice }: { notice: string }) {
  const form = useForm({
    defaultValues: {
      notice,
    },
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: saveNoticeAction,
    onSuccess: (r) => {
      if (r.success) toast.success("Notice saved successfully.");
      else toast.error(r.message);
    },
  });

  const submit = form.handleSubmit((data) => {
    if (mutation.isPending) return;

    mutation.mutate(data);
  });

  return (
    <div className="p-4 flex gap-4">
      <form className="space-y-4 flex-1" onSubmit={submit}>
        <Form {...form}>
          <FormField
            name="notice"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        <div className="flex items-center justify-end">
          <Button>
            {mutation.isPending && <LoaderCircle className="animate-spin" />}
            Save
          </Button>
        </div>
      </form>
      <div
        className="flex-1 prose-sm prose-ul:list-disc prose-ol:list-decimal prose-headings:text-primary prose-a:text-primary prose-a:underline"
        dangerouslySetInnerHTML={{ __html: md.render(form.watch("notice")) }}
      />
    </div>
  );
}
