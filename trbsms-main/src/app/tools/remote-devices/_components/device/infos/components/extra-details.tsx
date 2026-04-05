import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import Cell from "./cell";
import { Device } from "@/app/tools/remote-devices/page";

export default function ExtraDetails({
  deviceLocation,
  expireDate,
  operatingSystem,
  startDate,
  status,
  extraDate,
}: Pick<
  Device,
  | "deviceLocation"
  | "operatingSystem"
  | "startDate"
  | "expireDate"
  | "status"
  | "extraDate"
>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"icon"}
          className="rounded-full text-primary"
          variant={"ghost"}
        >
          <Plus />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-4 py-2">
        <div className="grid grid-cols-2 text-sm">
          <Cell>Location</Cell>
          <Cell>{deviceLocation || "-"}</Cell>
          <Cell>Operating System</Cell>
          <Cell>{operatingSystem || "-"}</Cell>
          <Cell>Start Date</Cell>
          <Cell>{startDate || "-"}</Cell>
          <Cell>Expire Date</Cell>
          <Cell>{expireDate || "-"}</Cell>
          <Cell>Extra Date</Cell>
          <Cell>{extraDate}</Cell>
          <Cell border={false}>Status</Cell>
          <Cell className="capitalize text-primary" border={false}>
            {status || "-"}
          </Cell>
        </div>
      </PopoverContent>
    </Popover>
  );
}
