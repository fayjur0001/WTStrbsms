import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import markdown from "markdown-it";

const md = markdown();

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default async function Page() {
  const auth = getAuth();
  if (!(await auth.verify())) return redirect("/");

  const tos = await SiteOptions.tos.get();

  return (
    <main className="p-4 prose-sm prose-ul:list-disc prose-ol:list-decimal prose-headings:text-primary prose-a:text-primary prose-a:underline">
      <div dangerouslySetInnerHTML={{ __html: md.render(tos) }} />
    </main>
  );
}
