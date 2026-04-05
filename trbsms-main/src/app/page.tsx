import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import Notice from "./_components/notice";

export const metadata = {
  title: "Notice",
};

export default async function Home() {
  const auth = getAuth();

  if (!(await auth.verify([]))) return redirect("/auth/login");

  return <Notice />;
}
