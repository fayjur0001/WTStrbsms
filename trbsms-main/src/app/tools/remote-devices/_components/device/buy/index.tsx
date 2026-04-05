import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import schema from "./schemas/buy.schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import buyAction from "./actions/buy.action";
import { LoaderCircle } from "lucide-react";
import { Device } from "../../../page";

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Buy({
  month,
  day,
  week,
  line,
  onSuccess: success,
}: Device["price"] & Pick<Device, "line"> & { onSuccess: () => void }) {
  const form = useForm({
    defaultValues: {
      mode: "day",
      note: "",
      line,
    },
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: buyAction,
    onSuccess: (r) => {
      if (r.success) {
        form.reset();
        success();
      } else toast.error(r.message);
    },
  });

  const submit = form.handleSubmit((data) => {
    if (mutation.isPending) return;

    mutation.mutate(data);
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          Buy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase a Device?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Please confirm your duration and note (optional)
        </DialogDescription>
        <form className="p-4 space-y-4" onSubmit={submit}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant={"outline"}
                      {...field}
                      onValueChange={field.onChange}
                    >
                      <ToggleGroupItem value="day">
                        Day ${formatter.format(day)}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="week">
                        Week ${formatter.format(week)}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="month">
                        Month ${formatter.format(month)}
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
          <DialogFooter>
            <Button>
              {mutation.isPending && <LoaderCircle className="animate-spin" />}
              Confirm
            </Button>
            <DialogClose asChild>
              <Button variant={"secondary"} type="button">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
