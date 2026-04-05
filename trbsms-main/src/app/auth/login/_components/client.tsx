"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { z } from "zod";
import loginSchema from "./schemas/login.schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import loginAction from "./actions/login.action";
import socket from "@/lib/utils/socket";
import staffPassPhase from "@/lib/utils/staff-pass-phase";
import { LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Client({ staff = false }: { staff?: boolean }) {
  const [hasError, setHasError] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: "",
      pinCode: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: loginAction,
    onSuccess: (r) => {
      if (r.success) {
        socket().emit("/auth/login", r.token, () => {
          toast.success("Logged in successfully.");
          router.replace("/");
        });
      } else {
        setHasError(true);
        if (!!r.field) {
          form.setError(r.field, {
            message: r.message,
          });
        } else {
          toast.error(r.message);
        }
      }
    },
  });

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const pinCode = form.getValues("pinCode");

    if (pinCode === staffPassPhase && staff === false)
      return router.push(`/auth/login/${staffPassPhase}`);

    form.handleSubmit((data) => {
      if (submitMutation.isPending) return;

      setHasError(false);

      submitMutation.mutate({ data, staff });
    })(e);
  }

  return (
    <form className="space-y-10" onSubmit={submit}>
      <div className="space-y-4">
        <Form {...form}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email/Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Email/Username"
                    autoComplete="username webauthn"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="* * * * * *"
                    type="password"
                    autoComplete="current-password webauthn"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pinCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pin Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Secret Code (Created by yourself)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-2 select-none cursor-pointer">
                  <Checkbox {...field} /> Remember me
                </label>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </div>
      <Button className="text-lg font-bold h-11 w-full">
        {(submitMutation.isPending ||
          (submitMutation.isSuccess && !hasError)) && (
          <LoaderCircle className="animate-spin" />
        )}
        Sign in
      </Button>
    </form>
  );
}
