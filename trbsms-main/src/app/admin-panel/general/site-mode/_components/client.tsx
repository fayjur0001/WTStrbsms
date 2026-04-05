"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import titlecase from "@/lib/utils/titlecase";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import changeSiteModeAction from "./actions/change-site-mode.action";

const modes = ["production", "maintenance"] as const;

export default function Client({ mode }: { mode: string }) {
  const form = useForm({
    defaultValues: {
      mode,
    },
  });

  const mutation = useMutation({
    mutationFn: changeSiteModeAction,
    onSuccess: (r) => {
      if (r.success) toast.success("Site mode changed successfully.");
      else toast.error(r.message);
    },
  });

  function change(value: string) {
    if (mutation.isPending) return;

    form.setValue("mode", value);

    mutation.mutate(value);
  }

  return (
    <form className="p-4">
      <ToggleGroup
        type="single"
        variant={"outline"}
        value={form.watch("mode")}
        onValueChange={change}
      >
        {modes.map((mode) => (
          <ToggleGroupItem key={mode} value={mode}>
            {titlecase(mode)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </form>
  );
}
