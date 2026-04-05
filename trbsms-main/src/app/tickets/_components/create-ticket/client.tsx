"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle, SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import getSchema from "./schemas/new-ticket.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import createTicketAction from "./actions/create-ticket.action";
import { zodResolver } from "@hookform/resolvers/zod";
import Role from "@/types/role.type";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import getUsersAction, { User } from "./actions/get-users.action";

export default function CreateTicket({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const users = useUsers();

  const schema = getSchema(role);

  const form = useForm<z.infer<ReturnType<typeof getSchema>>>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: "",
      description: "",
      // @ts-expect-error aaa
      userId: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: createTicketAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success("Ticket created successfully.");
        form.reset();
        setOpen(false);
      } else {
        toast.error(r.message);
      }
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (submitMutation.isPending) return;

    submitMutation.mutate(data);
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>+ Create</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Create Ticket</DialogTitle>
            </DialogHeader>
            {/* @ts-expect-error aaa */}
            <Content form={form} users={users} role={role} />
            <DialogFooter>
              <Button type="submit">
                {submitMutation.isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <SendIcon />
                )}{" "}
                Create Ticket
              </Button>
              <DialogClose asChild>
                <Button type="button" variant={"outline"}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function Content({
  form,
  users,
  role,
}: {
  form: UseFormReturn<z.infer<ReturnType<typeof getSchema>>>;
  users: User[];
  role: Role;
}) {
  return (
    <div className="space-y-4">
      <DialogDescription className="text-justify">
        Need Help? Ask one of our support agent. Keep patience after creating a
        ticket. We&apos;re trying our best to get back to you ASAP.
      </DialogDescription>
      <div className="px-6 space-y-4">
        {["admin", "super admin"].includes(role) && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={String(field.value)}
                    name={field.name}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.map(({ value, name }) => (
                          <SelectItem key={value} value={String(value)}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input {...field} placeholder="I want a..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  const query = useQuery({
    queryKey: ["tickets", "new", "users"],
    queryFn: getUsersAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) {
      setUsers(query.data.users);
    } else {
      toast.error(query.data.message);
    }
  }, [query.data]);

  return users;
}
