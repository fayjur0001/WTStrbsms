"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control, FieldPath, useForm } from "react-hook-form";
import { z } from "zod";
import schema from "./schemas/change-password.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import changePasswordAction from "./actions/change-password.action";
import { LoaderCircle } from "lucide-react";

export default function ChangePassword() {
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    resolver: zodResolver(schema),
  });

  const submitMutation = useMutation({
    mutationFn: changePasswordAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Password changed successfully.");
        form.reset();
      } else if (!!r.field) {
        form.setError(r.field, { message: r.message });
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
    <form className="space-y-4" onSubmit={submit}>
      <Form {...form}>
        <Field
          control={form.control}
          label={"Old Password"}
          name={"oldPassword"}
        />
        <Field
          control={form.control}
          label={"New Password"}
          name={"newPassword"}
        />
        <Field
          control={form.control}
          label={"Confirm New Password"}
          name={"confirmNewPassword"}
        />
      </Form>
      <Button>
        {submitMutation.isPending && <LoaderCircle className="animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}

function Field({
  control,
  label,
  name,
}: {
  control: Control<z.infer<typeof schema>>;
  label: string;
  name: FieldPath<z.infer<typeof schema>>;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              className="bg-background"
              type="password"
              placeholder="* * * * * * * *"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
