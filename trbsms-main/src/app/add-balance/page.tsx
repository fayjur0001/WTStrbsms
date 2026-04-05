import { Metadata } from "next";
import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import Client from "./_components";

export const metadata: Metadata = {
  title: "Add Balance",
};

export default async function AddBalance() {
  const auth = getAuth();

  if (!(await auth.verify([]))) {
    return redirect("/");
  }

  return <Client />;
}
