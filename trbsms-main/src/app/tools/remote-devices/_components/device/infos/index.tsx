import ShowAllDetails from "./components/show-all-details";
import TechnicalInfo from "./components/technical-info";
import ExtraDetails from "./components/extra-details";
import { Device } from "../../../page";

export default function Infos({
  device,
  currentPage,
}: {
  device: Omit<Device, "price">;
  currentPage: "available" | "assigned";
}) {
  return (
    <div className="flex gap-2">
      <ShowAllDetails device={device} />
      <TechnicalInfo
        pc={device.pc}
        speed={device.speed}
        anyDeskId={device.anyDeskId}
        anyDeskPassword={device.anyDeskPassword}
        expireDate={device.expireDate}
        extraDate={device.extraDate}
        startDate={device.startDate}
        currentPage={currentPage}
      />
      <ExtraDetails
        deviceLocation={device.deviceLocation}
        operatingSystem={device.operatingSystem}
        startDate={device.startDate}
        expireDate={device.expireDate}
        status={device.status}
        extraDate={device.extraDate}
      />
    </div>
  );
}
