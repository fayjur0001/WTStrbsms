import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import Cell from "./cell";
import { Device } from "@/app/tools/remote-devices/page";

export default function TechnicalInfo({
  pc,
  speed,
  anyDeskId,
  anyDeskPassword,
  expireDate,
  extraDate,
  startDate,
  currentPage,
}: Pick<
  Device,
  | "pc"
  | "speed"
  | "startDate"
  | "extraDate"
  | "expireDate"
  | "anyDeskId"
  | "anyDeskPassword"
> & { currentPage: "available" | "assigned" }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"icon"}
          className="rounded-full text-primary"
          variant={"ghost"}
        >
          <Info />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-4 py-2">
        <div className="text-xl text-primary space-y-2">Technical Info</div>
        <div className="text-sm grid grid-cols-4">
          <Cell border={currentPage === "assigned"}>PC</Cell>
          <Cell border={currentPage === "assigned"}>{pc}</Cell>
          <Cell border={currentPage === "assigned"}>Speed</Cell>
          <Cell border={currentPage === "assigned"}>{speed}</Cell>
          {currentPage === "assigned" && (
            <>
              <Cell>Start Date</Cell>
              <Cell>{startDate}</Cell>
              <Cell>Expire Date</Cell>
              <Cell>{expireDate}</Cell>
              <Cell>Extra Date</Cell>
              <Cell>{extraDate}</Cell>
              <Cell>AnyDesk Id</Cell>
              <Cell>{anyDeskId}</Cell>
              <Cell border={false}>AnyDesk Password</Cell>
              <Cell border={false}>{anyDeskPassword}</Cell>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
