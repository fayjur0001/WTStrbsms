import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MessageSquareMore } from "lucide-react";
import Cell from "./cell";
import { Device } from "@/app/tools/remote-devices/page";

export default function ShowAllDetails({
  device,
}: {
  device: Omit<Device, "price">;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"icon"}
          className="rounded-full text-primary"
          variant={"ghost"}
        >
          <MessageSquareMore />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-4 py-2">
        <div className="text-xl text-primary">Details</div>
        <div className="grid grid-cols-4">
          <Cell>Pc</Cell>
          <Cell>{device.pc}</Cell>
          <Cell>Status</Cell>
          <Cell className="capitalize">{device.status}</Cell>
          <Cell>Service Provider</Cell>
          <Cell>{device.serviceProvider}</Cell>
          <Cell>Speed</Cell>
          <Cell>{device.speed}</Cell>
          <Cell>Service Provider Expire</Cell>
          <Cell>{device.serviceProviderExpireDate}</Cell>
          <Cell>Duration</Cell>
          <Cell>{device.duration}</Cell>
          <Cell>Start Date</Cell>
          <Cell>{device.startDate || "-"}</Cell>
          <Cell>Expire Date</Cell>
          <Cell>{device.expireDate || "-"}</Cell>
          <Cell>Extra Date</Cell>
          <Cell>{device.extraDate}</Cell>
          <Cell>Supremo ID</Cell>
          <Cell>{device.supremoId || "-"}</Cell>
          <Cell>Supremo Pass</Cell>
          <Cell>{device.supremoPass || "-"}</Cell>
          <Cell>RDP ID</Cell>
          <Cell>{device.rdpID || "-"}</Cell>
          <Cell>RDP Password</Cell>
          <Cell>{device.rdpPassword || "-"}</Cell>
          <Cell>Reset URL</Cell>
          <Cell>{device.resetUrl || "-"}</Cell>
          <Cell>Port</Cell>
          <Cell>{device.port || "-"}</Cell>
          <Cell>Operating System</Cell>
          <Cell>{device.operatingSystem || "-"}</Cell>
          <Cell>Architecture</Cell>
          <Cell>{device.architecture || "-"}</Cell>
          <Cell>Note</Cell>
          <Cell>{device.note || "-"}</Cell>
          <Cell>Is Expire?</Cell>
          <Cell>{!!device.isExpire ? "On" : "Off"}</Cell>
          <Cell>Is Technical Issue?</Cell>
          <Cell>{!!device.isTechnicalIssue ? "On" : "Off"}</Cell>
          <Cell>Is V2</Cell>
          <Cell>{device.isV2 || "-"}</Cell>
          <Cell>Device Type</Cell>
          <Cell>{device.deviceType || "-"}</Cell>
          <Cell border={false}>Device Location</Cell>
          <Cell border={false}>{device.deviceLocation || "-"}</Cell>
        </div>
      </PopoverContent>
    </Popover>
  );
}
