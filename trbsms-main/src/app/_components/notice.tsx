import SiteOptions from "@/lib/utils/site-options";
import markdown from "markdown-it";
import { redirect } from "next/navigation";

const md = markdown();

export default async function Notice() {
  const notice = await SiteOptions.notice.get();

  if (!notice) return redirect("/tools/receive-sms");

  return (
    <main className="p-4">
      <div className="rounded-md bg-background-dark overflow-hidden max-w-250 mx-auto">
        <div className="text-2xl text-center font-bold bg-primary p-4">
          Notice
        </div>
        <div
          className="p-4 prose-sm prose-ul:list-disc prose-ol:list-decimal prose-headings:text-primary prose-a:text-primary prose-a:underline"
          dangerouslySetInnerHTML={{ __html: md.render(notice) }}
        />
      </div>
    </main>
  );
}
