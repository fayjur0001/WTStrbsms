import Card from "../card";
import PendingTopup from "./pending-topup";
import TotalTopup from "./total-topup";

export default function Info() {
  return (
    <div className="flex gap-2">
      <Card className="flex-1">
        <TotalTopup />
      </Card>
      <Card className="flex-1">
        <PendingTopup />
      </Card>
    </div>
  );
}
