import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

type Control = UseFormReturn["control"];

type Statuses = [string, ...string[]];

export default function Filter({
  control,
  statuses,
  onReset: reset,
  isLoading,
}: {
  control: Control;
  statuses: Statuses;
  onReset: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex gap-2 items-end">
      <Service control={control} />
      <Mdn control={control} />
      <Status control={control} statuses={statuses} />
      <Button variant={"secondary"}>
        {isLoading && <LoaderCircle className="animate-spin" />} Search
      </Button>
      <Button type="button" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}

function Service({ control }: { control: Control }) {
  return (
    <FormField
      control={control}
      name="service"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Mdn({ control }: { control: Control }) {
  return (
    <FormField
      control={control}
      name="mdn"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mdn</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Status({
  control,
  statuses,
}: {
  control: Control;
  statuses: Statuses;
}) {
  return (
    <FormField
      control={control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <FormControl>
            <Select {...field} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue className="w-full" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem value={status} key={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
