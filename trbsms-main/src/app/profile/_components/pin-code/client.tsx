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
import { Control, FieldPath, FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import schema from "./schemas/pin-code.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import changePinCodeAction from "./actions/pin-code.action";
import { LoaderCircle } from "lucide-react";

export default function ChangePinCode() {
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      oldPinCode: "",
      newPinCode: "",
      confirmNewPinCode: "",
    },
    resolver: zodResolver(schema),
  });

  const submitMutation = useMutation({
    mutationFn: changePinCodeAction,
    onSuccess: (r) => {
      if (r.success) {
        form.reset();
        toast.success("Pin code changed successfully.");
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
        <Field control={form.control} name="oldPinCode" label="Old Pin Code" />
        <Field control={form.control} name="newPinCode" label="New Pin Code" />
        <Field
          control={form.control}
          name="confirmNewPinCode"
          label="Confirm New Pin Code"
        />
      </Form>
      <Button>
        {submitMutation.isPending && <LoaderCircle className="animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}

function Field<Form extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<Form>;
  name: FieldPath<Form>;
  label: string;
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
              type="password"
              className="bg-background"
              {...field}
              placeholder="* * * * * *"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
