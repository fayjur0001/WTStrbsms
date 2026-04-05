import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import Client from "./_components/client";
import SiteOptions from "@/lib/utils/site-options";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Site Title | Admin Panel",
};

export default async function SiteTitle() {
  const auth = getAuth();
  if (!(await auth.verify(["admin", "super admin"]))) return redirect("/");

  const siteName = await SiteOptions.siteName.get();

  return (
    <main className="p-4">
      <div className="max-w-250 mx-auto bg-background-dark rounded-md overflow-hidden">
        <h1 className="text-2xl text-center font-bold bg-primary p-2">
          Change Site Title
        </h1>
        <Client siteName={siteName} />
      </div>
    </main>
  );
}
