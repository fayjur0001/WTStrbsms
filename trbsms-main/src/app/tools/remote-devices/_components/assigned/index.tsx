import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import getAssignedDevicesAction from "./actions/get-assigned-devices.action";
import Device from "../device";

export default function Assigned() {
  const { devices, isLoading } = useDevices();

  return (
    <div className="grid grid-cols-4 gap-4">
      {isLoading ? (
        Array(16)
          .fill(0)
          .map((_, i) => <div key={i} className="loading h-50" />)
      ) : !devices.length ? (
        <p>No assigned device found.</p>
      ) : (
        devices.map((device) => (
          <Device currentPage="assigned" key={device.line} {...device} />
        ))
      )}
    </div>
  );
}

type TDevice = Extract<
  Awaited<ReturnType<typeof getAssignedDevicesAction>>,
  { success: true }
>["devices"][number];

function useDevices(): { devices: TDevice[]; isLoading: boolean } {
  const [devices, setDevices] = useState<TDevice[]>([]);

  const query = useQuery({
    queryKey: ["tools", "remote-devices", "assigned"],
    queryFn: getAssignedDevicesAction,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setDevices(query.data.devices);
    else toast.error(query.data.message);
  }, [query.data]);

  return {
    devices,
    isLoading: query.isLoading,
  };
}
