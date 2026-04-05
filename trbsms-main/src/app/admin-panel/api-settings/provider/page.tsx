import getAuth from "@/lib/utils/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Client from "./_components/client";
import SiteOptions from "@/lib/utils/site-options";

export const metadata: Metadata = {
  title: "Api Settings",
};

export default async function Page() {
  const auth = getAuth();
  if (!(await auth.verify(["super admin"]))) return redirect("/");

  return (
    <main className="p-6">
      <div className="bg-background-dark p-4 rounded-md space-y-4">
        <h1 className="text-primary text-2xl font-semibold">Api Settings</h1>
        <Client hostUrl={await SiteOptions.hostUrl.get()} />
      </div>
    </main>
  );
}
