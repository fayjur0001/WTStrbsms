import getAuth from "@/lib/utils/auth";
import Client from "./_components/client";
import { redirect } from "next/navigation";
import SiteOptions from "@/lib/utils/site-options";

export const metadata = {
  title: "Notice | Admin Panel",
};

export default async function Page() {
  const auth = getAuth();
  if (!(await auth.verify(["admin", "super admin"]))) return redirect("/");

  const notice = await SiteOptions.notice.get();

  return (
    <main className="p-4">
      <div className="bg-background-dark overflow-hidden rounded-md">
        <div className="p-4 bg-primary text-center text-2xl font-bold">
          Notice
        </div>
        <Client notice={notice} />
      </div>
    </main>
  );
}
