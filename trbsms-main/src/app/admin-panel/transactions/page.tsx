import getAuth from "@/lib/utils/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Client from "./_components/client";
import db from "@/db";
import { sql } from "drizzle-orm";
import { AddedFundModel } from "@/db/schema";

export const metadata: Metadata = {
  title: "Buyer Top Ups",
};

export default async function Page() {
  const auth = getAuth();

  if (!(await auth.verify(["super admin"]))) return redirect("/");

  const currencies: string[] = await db
    .select({ currency: sql<string>`distinct currency` })
    .from(AddedFundModel)
    .then((res) => res.map((r) => r.currency));

  return (
    <main className="p-4">
      <div className="bg-background-dark rounded-md">
        <h1 className="text-2xl p-4 font-bold text-primary">Buyer Top Ups</h1>
        <Client walletNames={["All", ...currencies]} />
      </div>
    </main>
  );
}
