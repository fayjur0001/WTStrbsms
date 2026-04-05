"use client";

import staffPassPhase from "@/lib/utils/staff-pass-phase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Pass() {
  const router = useRouter();

  const form = useForm({});

  const submit = form.handleSubmit((data) => {
    if (data.pass === staffPassPhase)
      router.push(`/auth/login/${staffPassPhase}`);
  });

  return (
    <form onSubmit={submit}>
      <input {...form.register("pass")} className="absolute right-0 bottom-0" />
    </form>
  );
}
