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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import schema from "./schemas/schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import getDefaultValuesAction from "./actions/get-default-values.action";
import { useMutation } from "@tanstack/react-query";
import setApiSettingsAction from "./actions/set-api-settings.action";
import { LoaderCircle } from "lucide-react";
import Callback from "./components/callback";
// import DevicesSettings from "./components/devices-settings";
// import DevicesCut from "./components/devices-cut";

export default function Client({ hostUrl }: { hostUrl: string }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      apiKey: "",
      apiUser: "",
      sharedProxyPrice: {
        hour: 0,
        day: 0,
        month: 0,
        week: 0,
      },
      exclusiveProxyPrice: {
        hour: 0,
        day: 0,
        month: 0,
        week: 0,
      },
      cut: {
        oneTime: 0,
        longTerm: {
          short: 0,
          regular: 0,
          unlimited: 0,
        },
        proxy: {
          shared: {
            day: 0,
            week: 0,
            month: 0,
          },
          exclusive: {
            day: 0,
            week: 0,
            month: 0,
          },
        },
        device: {
          day: 0,
          week: 0,
          month: 0,
        },
      },
      callbackSecret: "",
      devices: {
        login: "",
        password: "",
      },
    },
  });

  useDefaultValues(form);

  const setApiSettingsMutation = useMutation({
    mutationFn: setApiSettingsAction,
    onSuccess: (r) => {
      if (r.success) toast.success("Api Settings updated.");
      else toast.error(r.message);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (setApiSettingsMutation.isPending) return;

    setApiSettingsMutation.mutate(data);
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Form {...form}>
        <div className="grid grid-cols-2 gap-2">
          <User control={form.control} />
          <ApiKey control={form.control} />
        </div>
        <AdminCutPerTransaction control={form.control} />
        {/* <Proxy control={form.control} /> */}
        <Callback form={form} hostUrl={hostUrl} />
        {/* <DevicesSettings control={form.control} /> */}
      </Form>
      <div className="flex justify-end items-center gap-2">
        <Button>
          {setApiSettingsMutation.isPending && (
            <LoaderCircle className="animate-spin" />
          )}
          Save
        </Button>
      </div>
    </form>
  );
}

function ApiKey({ control }: { control: Control }) {
  return (
    <FormField
      control={control}
      name="apiKey"
      render={({ field }) => (
        <FormItem>
          <FormLabel>API Key</FormLabel>
          <FormControl>
            <Input {...field} type="password" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type Control = UseFormReturn<z.infer<typeof schema>>["control"];

function User({ control }: { control: Control }) {
  return (
    <FormField
      control={control}
      name="apiUser"
      render={({ field }) => (
        <FormItem>
          <FormLabel>API User</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function useDefaultValues(form: UseFormReturn<z.infer<typeof schema>>) {
  const query = useQuery({
    queryKey: ["admin-panel", "transaction-cut"],
    queryFn: getDefaultValuesAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success)
      form.reset({
        apiKey: query.data.apiKey,
        apiUser: query.data.user,
        exclusiveProxyPrice: query.data.exclusiveProxyPrice,
        sharedProxyPrice: query.data.sharedProxyPrice,
        cut: query.data.cut,
        callbackSecret: query.data.callbackSecret,
        devices: query.data.devices,
      });
    else toast.error(query.data.message);
  }, [form, query.data]);
}



function AdminCutPerTransaction({ control }: { control: Control }) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="cut.oneTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>One Time</FormLabel>
            <FormControl>
              <Input {...field} type="number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <LongTermCut control={control} />
    </div>
  );
}

function LongTermCut({ control }: { control: Control }) {
  return (
    <div className="space-y-4">
      <div className="text-primary text-xl">Admin Cut for Long Term MDN</div>
      <div className="grid grid-cols-3 gap-2">
        <FormField
          control={control}
          name="cut.longTerm.short"
          render={({ field }) => (
            <FormItem>
              <FormLabel>3 days</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="cut.longTerm.regular"
          render={({ field }) => (
            <FormItem>
              <FormLabel>30 days</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="cut.longTerm.unlimited"
          render={({ field }) => (
            <FormItem>
              <FormLabel>30 days, unlimited</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
