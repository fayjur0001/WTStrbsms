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
import getSchema from "./schemas/edit.schema";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import editAction from "./actions/edit.action";

export default function Client({
  id,
  username,
  email,
  jabber,
  telegram,
}: {
  id: number;
  username: string;
  email: string;
  jabber: string;
  telegram: string;
}) {
  const router = useRouter();

  const schema = getSchema(id);

  const form = useForm({
    defaultValues: {
      id,
      username,
      email,
      jabber,
      telegram,
    },
    resolver: zodResolver(schema),
  });

  function back() {
    router.back();
  }

  const editMutation = useMutation({
    mutationFn: editAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("User edited successfully.");
        back();
      } else {
        toast.error(r.message);
      }
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (editMutation.isPending) return;

    editMutation.mutate(data);
  });

  return (
    <form className="p-4 space-y-4" onSubmit={onSubmit}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jabber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jabber</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telegram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telegram</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      <div className="flex items-center justify-end gap-2">
        <Button>Save</Button>
        <Button variant="secondary" type="button" onClick={back}>
          Back
        </Button>
      </div>
    </form>
  );
}
