import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import titlecase from "@/lib/utils/titlecase";
import TRole from "@/types/role.type";
import { LoaderCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

export default function Filter({
  control,
  roles,
  onReset: reset,
  isLoading,
}: {
  control: UseFormReturn["control"];
  roles: (TRole | "all")[];
  onReset: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <Username control={control} />
        <Email control={control} />
        <Role control={control} roles={roles} />
        <Button variant={"secondary"}>
          {isLoading && <LoaderCircle className="animate-spin" />}Search
        </Button>
        <Button type="button" onClick={reset}>
          Reset
        </Button>
      </div>
      <div className="flex gap-2">
        <BannedOnlyCheckbox control={control} />
        <OnlineOnlyCheckbox control={control} />
      </div>
    </div>
  );
}

function Username({ control }: { control: UseFormReturn["control"] }) {
  return (
    <FormField
      control={control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Email({ control }: { control: UseFormReturn["control"] }) {
  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Role({
  control,
  roles,
}: {
  control: UseFormReturn["control"];
  roles: (TRole | "all")[];
}) {
  return (
    <FormField
      control={control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <FormControl>
            <Select {...field} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem value={role} key={role}>
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
  );
}

function BannedOnlyCheckbox({
  control,
}: {
  control: UseFormReturn["control"];
}) {
  return (
    <FormField
      control={control}
      name="bannedOnly"
      render={({ field }) => (
        <FormItem>
          <Label>
            <Checkbox
              {...field}
              onCheckedChange={field.onChange}
              checked={field.value}
            />
            Banned Only
          </Label>
        </FormItem>
      )}
    />
  );
}

function OnlineOnlyCheckbox({
  control,
}: {
  control: UseFormReturn["control"];
}) {
  return (
    <FormField
      control={control}
      name="onlineOnly"
      render={({ field }) => (
        <FormItem>
          <Label>
            <Checkbox
              {...field}
              onCheckedChange={field.onChange}
              checked={field.value}
            />
            Online Only
          </Label>
        </FormItem>
      )}
    />
  );
}
