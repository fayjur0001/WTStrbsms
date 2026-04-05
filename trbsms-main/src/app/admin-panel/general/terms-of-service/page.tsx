import { Metadata } from "next";
import Client from "./_components/client";
import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import SiteOptions from "@/lib/utils/site-options";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default async function TOS() {
  const auth = getAuth();
  if (!(await auth.verify(["admin", "super admin"]))) return redirect("/");

  const tos = await SiteOptions.tos.get();

  return (
    <main className="p-4">
      <div className="bg-background-dark rounded-md overflow-hidden">
        <div className="p-4 bg-primary text-2xl font-bold text-center">
          Terms of Service
        </div>
        <Client defaultValues={{ tos }} />
      </div>
    </main>
  );
}
