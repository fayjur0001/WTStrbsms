import getAuth from "@/lib/utils/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Client from "./_components/client";
import SiteOptions from "@/lib/utils/site-options";

export const metadata: Metadata = {
  title: "Site Mode | Admin Panel",
};

export default async function Page() {
  const auth = getAuth();
  if (!(await auth.verify(["admin", "super admin"]))) return redirect("/");

  const mode = await SiteOptions.siteMode.get();

  return (
    <main className="p-4">
      <div className="bg-background-dark rounded-md overflow-hidden max-w-250 mx-auto">
        <div className="text-2xl font-bold text-center bg-primary p-4">
          Site Mode
        </div>
        <Client mode={mode} />
      </div>
    </main>
  );
}
