import getAuth from "@/lib/utils/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Client from "./_components/client";
import { OneTimeRentModel } from "@/db/schema";

export const metadata: Metadata = {
  title: "Receive SMS",
};

export default async function ReceiveSMS() {
  const auth = getAuth();

  if (!(await auth.verify([]))) return redirect("/");

  return <Client statuses={["All", ...OneTimeRentModel.status.enumValues]} />;
}
