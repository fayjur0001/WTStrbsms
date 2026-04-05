import getAuth from "@/lib/utils/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Client from "./_components/client";
import { UserModel } from "@/db/schema";
import db from "@/db";
import nowPaymentsApiUrl from "@/lib/utils/now-payments-api-url";
import SiteOptions from "@/lib/utils/site-options";

export const metadata: Metadata = {
  title: "New Transaction | Admin Panel",
};

export default async function New() {
  const auth = getAuth();
  if (!(await auth.verify(["super admin"]))) return redirect("/");

  const users = await db
    .select({
      value: UserModel.id,
      label: UserModel.username,
    })
    .from(UserModel);

  const url = `${nowPaymentsApiUrl}/merchant/coins`;

  const apiKey = await SiteOptions.payment.apiKey.get();

  const res: { selectedCurrencies: string[] } = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
    },
  }).then((r) => r.json());

  const currencies: string[] = res.selectedCurrencies;

  return (
    <main className="p-4">
      <div className="bg-background-dark rounded-md overflow-hidden md:w-250 mx-auto">
        <div className="bg-primary p-4 text-center">
          <h1 className="text-2xl font-bold">New Transaction</h1>
        </div>
        <Client
          walletNames={currencies as [string, ...string[]]}
          users={users}
        />
      </div>
    </main>
  );
}
