import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import Client from "./_components";

export const metadata = {
  title: "Remote Devices",
};

export default async function Page() {
  const auth = getAuth();

  if (!(await auth.verify([]))) return redirect("/");

  return <Client />;
}

export type Device = {
  line: string;
  pc: string;
  speed: string;
  serviceProvider: string;
  deviceType: string;
  status: string;
  serviceProviderExpireDate: string;
  duration: "Daily" | "Weekly" | "Monthly";
  startDate: string;
  expireDate: string;
  extraDate: number;
  supremoId: string;
  supremoPass: string;
  rdpID: string;
  rdpPassword: string;
  resetUrl: string;
  port: string;
  operatingSystem: string;
  architecture: string;
  note: string;
  isExpire: unknown;
  isTechnicalIssue: unknown;
  isV2: string;
  deviceLocation: string;
  anyDeskId: string;
  anyDeskPassword: string;
  price: {
    day: number;
    week: number;
    month: number;
  };
};
