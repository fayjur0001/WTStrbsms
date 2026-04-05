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
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import editAction from "./actions/edit.action";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

export default function Client({ value }: { value: string }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      hostUrl: value,
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
        toast.success("Host url updated successfully.");
      } else toast.error(r.message);
    },
  });

  const submit = form.handleSubmit((data) => {
    if (mutation.isPending) return;

    mutation.mutate(data);
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <Form {...form}>
        <FormField
          control={form.control}
          name="hostUrl"
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
        <Button variant="secondary" type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
}
