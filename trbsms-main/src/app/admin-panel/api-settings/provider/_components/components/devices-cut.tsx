import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { z } from "zod";
import schema from "../schemas/schema";
import { Input } from "@/components/ui/input";

export default function DevicesCut({
  control,
}: {
  control: Control<z.infer<typeof schema>>;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-primary text-xl">Admin Cut for Devices</h1>
      <div className="grid grid-cols-3 gap-2">
        <FormField
          control={control}
          name="cut.device.day"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="cut.device.week"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Week</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="cut.device.month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
