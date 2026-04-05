import { ReactNode } from "react";
import Username from "./_components/username/client";
import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import db from "@/db";
import Email from "./_components/email/client";
import Jabber from "./_components/jabber/client";
import Telegram from "./_components/telegram/client";
import ChangePassword from "./_components/password/client";
import { Metadata } from "next";
import ChangePinCode from "./_components/pin-code/client";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function Profile() {
  const auth = getAuth();

  if (!(await auth.verify([]))) {
    return redirect("/");
  }

  const payload = await auth.getPayload();

  const user = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.id, payload.id),
    columns: { username: true, email: true, jabber: true, telegram: true },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return (
    <main className="p-6 space-y-6">
      <Card>
        <Section header="Information">
          <Username username={user.username} />
        </Section>
        <Section header="Contacts">
          <Email email={user.email} />
          <Jabber jabber={user.jabber || ""} />
          <Telegram telegram={user.telegram || ""} />
        </Section>
      </Card>
      <div className="flex gap-4 items-stretch">
        <div className="flex-1">
          <Card>
            <Section header="Change Password">
              <ChangePassword />
            </Section>
          </Card>
        </div>
        <div className="flex-1">
          <Card>
            <Section header="Change Pin Code">
              <ChangePinCode />
            </Section>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Card({ children }: { children?: ReactNode }) {
  return (
    <div className="p-4 rounded-md bg-background-dark space-y-2 h-full">
      {children}
    </div>
  );
}

function Section({
  children,
  header,
}: {
  children?: ReactNode;
  header?: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-primary font-bold text-lg">{header}</h2>
      {children}
    </div>
  );
}
