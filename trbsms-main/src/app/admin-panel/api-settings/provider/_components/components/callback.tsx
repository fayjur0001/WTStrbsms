import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import schema from "../schemas/schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function Callback({
  form,
  hostUrl,
}: {
  form: UseFormReturn<z.infer<typeof schema>>;
  hostUrl: string;
}) {
  const callbackSecret = form.watch("callbackSecret");

  let url = "";
  try {
    const a = new URL(`${hostUrl}/tools/callback`);
    if (callbackSecret) {
      a.searchParams.set("secret", callbackSecret);
    }
    url = a.toString();
  } catch {
    url = `${hostUrl}/tools/callback${callbackSecret ? `?secret=${callbackSecret}` : ""}`;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl text-primary">Callback</h2>
      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="callbackSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Callback Secret</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Callback Secret" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Callback URL</FormLabel>
          <Input
            value={url}
            placeholder="Callback URL"
            readOnly
          />
        </FormItem>
      </div>
    </div>
  );
}
