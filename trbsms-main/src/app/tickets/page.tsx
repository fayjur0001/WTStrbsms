import { Metadata } from "next";
import CreateTicket from "./_components/create-ticket/client";
import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import MyTickets from "./_components/my-tickets/client";
import UnclaimedTickets from "./_components/unclaimed-tickets/client";
import OtherTickets from "./_components/other-tickets";

export const metadata: Metadata = {
  title: "Tickets",
};

export default async function Tickets() {
  const auth = getAuth();

  if (!(await auth.verify([]))) return redirect("/");

  const payload = await auth.getPayload();

  return (
    <main className="px-6 py-4">
      <div className="bg-background-dark py-6 rounded-xl space-y-6">
        <div className="flex items-center justify-end px-6">
          <CreateTicket role={payload.role} />
        </div>
        {["super admin", "admin", "support"].includes(payload.role) && (
          <UnclaimedTickets />
        )}
        <MyTickets />
        {["super admin"].includes(payload.role) && <OtherTickets />}
      </div>
    </main>
  );
}
