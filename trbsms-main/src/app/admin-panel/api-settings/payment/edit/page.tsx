import getAuth from "@/lib/utils/auth";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import Client from "./_components";
import SiteOptions from "@/lib/utils/site-options";

export const metadata = {
  title: "Edit Payment Settings | Admin Panel",
};

const schema = z.object({
  label: z.enum(["Callback Secret", "Api Key"]),
});

export default async function Page(props: { searchParams: Promise<unknown> }) {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"]))) redirect("/");

  let params: z.infer<typeof schema>;
  try {
    params = schema.parse(await props.searchParams);
  } catch {
    notFound();
  }

  const label: "callbackSecret" | "apiKey" =
    params.label === "Callback Secret" ? "callbackSecret" : "apiKey";

  const value = await SiteOptions.payment[label].get();

  return (
    <main className="p-4">
      <div className="bg-background-dark p-4 rounded-md space-y-4">
        <h1 className="text-primary text-2xl font-bold">Edit {params.label}</h1>
        <Client label={label} value={value} />
      </div>
    </main>
  );
}
