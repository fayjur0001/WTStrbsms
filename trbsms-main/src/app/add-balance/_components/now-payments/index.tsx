import Copy from "../copy";
import Instructions from "../instructions";
import QRCode from "../QRCode";
import Generate from "./generate";

export default function NowPayments({
  walletAddress: address,
  amount,
  currency,
}: {
  walletAddress?: string;
  amount?: number;
  currency?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-2">
      <Instructions />
      <Generate />
      {!!address && (
        <Copy amount={amount} currency={currency} address={address} />
      )}
      {!!address && <QRCode value={address} />}
    </div>
  );
}
