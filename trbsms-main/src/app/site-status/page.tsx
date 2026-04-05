import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import titlecase from "@/lib/utils/titlecase";
import { redirect } from "next/navigation";
import Pass from "./_components/pass";

export const metadata = {
  title: "Site Status",
};

export default async function Page() {
  const auth = getAuth();
  if (!(await auth.verify())) return redirect("/");

  const mode = await SiteOptions.siteMode.get();

  if (mode === "production") return redirect("/");

  return (
    <main className="p-4">
      <div className="bg-background-dark rounded-md max-w-250 mx-auto overflow-hidden">
        <div className="bg-primary p-4 text-2xl font-bold text-center">
          {titlecase(mode)} Mode
        </div>
        <div className="p-4">
          Site is under {mode} mode.{" "}
          {mode === "maintenance"
            ? "Please be patient while we work on it. This is important for our users."
            : ""}
        </div>
      </div>
      <Pass />
    </main>
  );
}
