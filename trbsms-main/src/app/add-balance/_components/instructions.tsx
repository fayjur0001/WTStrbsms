import Card from "./card";

export default function Instructions() {
  return (
    <Card className="flex-1">
      <div className="text-2xl font-bold">Instructions</div>
      <p className="text-justify">
        Add extra amount to recover the gas fee. After you have sent the funds-
        wait for a few confirmations on the blockchain to see your transactuion
        status/history in the top-up history table below. <br />
        Create a support ticket with the TXID/Hash ID if you face any issues or
        need help.
      </p>
    </Card>
  );
}
