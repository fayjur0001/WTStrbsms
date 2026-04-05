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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import titlecase from "@/lib/utils/titlecase";
import Role from "@/types/role.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import getChangeRoleSchema from "./schemas/get-change-role.schema";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import changeRoleAction from "./actions/change-role.action";

export default function Client({
  roles,
  previousRole,
  userId,
}: {
  roles: [string, ...string[]];
  userId: number;
  previousRole: Role;
}) {
  const router = useRouter();

  const schema = getChangeRoleSchema(roles);

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      role: previousRole,
      userId,
    },
    resolver: zodResolver(schema),
  });

  const changeRoleMutation = useMutation({
    mutationFn: changeRoleAction,
    onSuccess: (r) => {
      if (r.success) {
        router.back();
        toast.success("Role changed successfully.");
      } else {
        toast.error(r.message);
      }
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (changeRoleMutation.isPending) return;

    changeRoleMutation.mutate(data);
  });

  function back() {
    router.back();
  }

  return (
    <form className="p-4 space-y-4" onSubmit={onSubmit}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        disabled={role === previousRole}
                      >
                        {titlecase(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
