import { useQuery } from "@tanstack/react-query";
import Device from "../device";
import getAvailableDevicesAction from "./actions/get-available-devices.action";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useRefresh from "@/hooks/use-refresh";

export default function Available({
  onSuccess: success,
}: {
  onSuccess: () => void;
}) {
  const { devices, isLoading } = useDevices();

  return (
    <div className="grid grid-cols-4 gap-4">
      {isLoading
        ? Array(16)
            .fill(0)
            .map((_, i) => <div key={i} className="loading h-50" />)
        : devices.map((device) => (
            <Device
              currentPage="available"
              onSuccess={success}
              key={device.line}
              {...device}
            />
          ))}
    </div>
  );
}

type TDevice = Extract<
  Awaited<ReturnType<typeof getAvailableDevicesAction>>,
  { success: true }
>["devices"][number];

function useDevices(): { devices: TDevice[]; isLoading: boolean } {
  const [devices, setDevices] = useState<TDevice[]>([]);

  const query = useQuery({
    queryKey: ["tools", "remote-devices", "available"],
    queryFn: getAvailableDevicesAction,
  });

  useRefresh("/tools/remote-devices/available", query.refetch);

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setDevices(query.data.devices);
    else toast.error(query.data.message);
  }, [query.data]);

  return { devices, isLoading: query.isLoading };
}
