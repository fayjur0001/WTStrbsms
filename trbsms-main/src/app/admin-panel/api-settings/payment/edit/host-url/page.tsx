import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import { redirect } from "next/navigation";
import Client from "./_components";

export const metadata = {
  title: "Edit Host Url | Admin Panel",
};

export default async function Page() {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"]))) redirect("/");

  const value = await SiteOptions.hostUrl.get();

  return (
    <main className="p-4">
      <div className="bg-background-dark p-4 rounded-md space-y-4">
        <h1 className="text-primary text-xl font-bold">Edit Host Url</h1>
        <Client value={value} />
      </div>
    </main>
  );
}
