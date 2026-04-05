import { Device as TDevice } from "../../page";
import Buy from "./buy";
import Infos from "./infos";

export default function Device(
  props:
    | ({ currentPage: "available"; onSuccess: () => void } & TDevice)
    | ({ currentPage: "assigned" } & Omit<TDevice, "price">),
) {
  return (
    <div className="p-4 space-y-2 rounded-md shadow bg-background-dark">
      <div className="flex gap-2 items-center justify-between text-xs">
        <span>PC</span>
        <span className="text-primary text-right">{props.pc}</span>
      </div>
      <div className="flex gap-2 items-center justify-between text-xs">
        <span className="uppercase">speed</span>
        <span className="text-right">{props.speed}</span>
      </div>
      <div className="flex gap-2 items-center justify-between text-xs">
        <span className="uppercase">service provider</span>
        <span className="text-right">{props["serviceProvider"]}</span>
      </div>
      <div className="flex gap-2 items-center justify-between text-xs">
        <span className="uppercase">device type</span>
        <span className="text-right">{props["deviceType"]}</span>
      </div>
      <div className="flex gap-2 items-center justify-between">
        {props.currentPage === "assigned" ? (
          <div />
        ) : (
          <Buy
            month={props.price.month}
            day={props.price.day}
            week={props.price.week}
            line={props.line}
            onSuccess={props.onSuccess}
          />
        )}
        <Infos currentPage={props.currentPage} device={props} />
      </div>
    </div>
  );
}
