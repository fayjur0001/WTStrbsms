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
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import schema from "./schemas/register.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import registerAction from "./actions/register.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export default function Client() {
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      pinCode: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: registerAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Registration successful. Please login.");
        router.push("/auth/login");
      } else {
        setHasError(true);
        toast.error(r.message);
      }
    },
  });

  const submit = form.handleSubmit(async (data) => {
    if (submitMutation.isPending) return;

    setHasError(false);
    submitMutation.mutate(data);
  });

  return (
    <form className="space-y-8" onSubmit={submit}>
      <div className="space-y-4">
        <Form {...form}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Smith"
                    autoComplete="username webauthn"
                  />
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
                  <Input
                    {...field}
                    placeholder="example@xyz.com"
                    autoComplete="email webauthn"
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
                    placeholder="* * * * * * * *"
                    type="password"
                    autoComplete="new-password webauthn"
                  />
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
                  <Input
                    {...field}
                    placeholder="* * * * * * * *"
                    type="password"
                    autoComplete="new-password webauthn"
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
                    placeholder="Secret Code (Create by yourself)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </div>

      <p>
        Please read{" "}
        <Link
          href={"/auth/terms-of-service"}
          className="text-primary hover:underline"
        >
          Terms of Service
        </Link>{" "}
        before signing up.
      </p>

      {/* Buttons Section: Back + Sign Up */}
      <div className="flex justify-between items-center gap-4">
        {/* Back Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="flex-1 md:h-12 md:text-lg"
        >
          Back
        </Button>

        {/* Sign Up Button */}
        <Button
          type="submit"
          className="flex-1 md:h-12 md:text-lg flex items-center justify-center gap-2"
        >
          {(submitMutation.isPending ||
            (submitMutation.isSuccess && !hasError)) && (
            <LoaderCircle className="animate-spin" />
          )}
          Sign Up
        </Button>
      </div>

      <div className="text-right mt-2">
        Already a member?{" "}
        <Link href="/auth/login" className="text-primary underline font-bold">
          Sign in
        </Link>
      </div>
    </form>
  );
}
