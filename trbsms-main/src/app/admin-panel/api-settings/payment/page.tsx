import getAuth from "@/lib/utils/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Client from "./_components";

export const metadata: Metadata = {
  title: "Payment API | Admin Panel",
};

export default async function PaymentApi() {
  const auth = getAuth();

  if (!(await auth.verify(["super admin"]))) {
    return redirect("/");
  }

  return (
    <main className="p-4">
      <div className="bg-background-dark p-4 rounded-md space-y-4">
        <h1 className="text-primary text-2xl font-bold">Payment Api</h1>
        <Client />
      </div>
    </main>
  );
}
