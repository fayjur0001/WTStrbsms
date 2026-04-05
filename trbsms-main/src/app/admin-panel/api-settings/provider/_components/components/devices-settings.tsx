import { Control } from "react-hook-form";
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

export default function DevicesSettings({
  control,
}: {
  control: Control<z.infer<typeof schema>>;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl text-primary">Devices Settings</h2>
      <div className="grid grid-cols-2 gap-2">
        <Login control={control} />
        <Password control={control} />
      </div>
    </div>
  );
}

function Password({ control }: { control: Control<z.infer<typeof schema>> }) {
  return (
    <FormField
      control={control}
      name="devices.password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input {...field} type="password" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Login({ control }: { control: Control<z.infer<typeof schema>> }) {
  return (
    <FormField
      control={control}
      name="devices.login"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Login</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
