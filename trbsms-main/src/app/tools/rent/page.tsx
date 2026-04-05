import { Metadata } from "next";
import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import { LongTermRentsModel } from "@/db/schema";
import Client from "./_components/client";

export const metadata: Metadata = {
  title: "Rent",
};

export default async function Rent() {
  const auth = getAuth();

  if (!(await auth.verify([]))) return redirect("/");

  return (
    <Client
      onlineStatusArray={["All", ...LongTermRentsModel.onlineStatus.enumValues]}
      statusArray={["All", ...LongTermRentsModel.status.enumValues]}
    />
  );
}
