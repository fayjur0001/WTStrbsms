"use client";

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
import schema from "./schemas/site-name.schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import changeSiteNameAction from "./actions/change-site-name.action";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

export default function Client({ siteName }: { siteName: string }) {
  const form = useForm({
    defaultValues: {
      siteName,
    },
    resolver: zodResolver(schema),
  });

  const changeSiteNameMutation = useMutation({
    mutationFn: changeSiteNameAction,
    onSuccess: (r) => {
      if (r.success) toast.success("Site name changed successfully.");
      else toast.error(r.message);
    },
  });

  const submit = form.handleSubmit((data) => {
    if (changeSiteNameMutation.isPending) return;
    changeSiteNameMutation.mutate(data);
  });

  return (
    <form className="space-y-4 p-4" onSubmit={submit}>
      <Form {...form}>
        <FormField
          control={form.control}
          name={"siteName"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      <div className="flex justify-end items-center gap-2">
        <Button>
          {changeSiteNameMutation.isPending && (
            <LoaderCircle className="animate-spin" />
          )}
          Save
        </Button>
      </div>
    </form>
  );
}
