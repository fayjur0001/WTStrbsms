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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import schema from "./schemas/change-password.schema";
import { useMutation } from "@tanstack/react-query";
import changePasswoedAction from "./actions/change-password.action";
import { toast } from "sonner";

export default function Client({ id }: { id: number }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      id,
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(schema),
  });

  function back() {
    router.back();
  }

  const changePasswoedMutation = useMutation({
    mutationFn: changePasswoedAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Password changed successfully.");
        back();
      } else {
        toast.error(r.message);
      }
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (changePasswoedMutation.isPending) return;

    changePasswoedMutation.mutate(data);
  });

  return (
    <form className="p-4 space-y-4" onSubmit={onSubmit}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      <div className="flex items-center justify-end gap-2">
        <Button>Save</Button>
        <Button onClick={back} variant="secondary" type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
}
