"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import schema from "./schemas/edit.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import editAction from "./actions/edit-action";
import { LoaderCircle } from "lucide-react";

export default function Client({
  label,
  value,
}: {
  label: "callbackSecret" | "apiKey";
  value: string;
}) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      value,
      label,
    },
    resolver: zodResolver(schema),
  });

  function back() {
    router.back();
  }

  const mutation = useMutation({
    mutationFn: editAction,
    onSuccess: (r) => {
      if (r.success) {
        back();
        toast.success("Settings updated successfully.");
      } else toast.error(r.message);
    },
  });

  const submit = form.handleSubmit((data) => {
    if (mutation.isPending) return;

    mutation.mutate(data);
  });

  return (
    <form className="space-y-4" onSubmit={submit}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      <div className="flex items-center justify-end gap-2">
        <Button>
          {mutation.isPending && <LoaderCircle className="animate-spin" />} Save
        </Button>
        <Button variant="secondary" type="button" onClick={back}>
          Back
        </Button>
      </div>
    </form>
  );
}
