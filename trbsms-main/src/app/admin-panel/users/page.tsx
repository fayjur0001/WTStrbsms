import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import Client from "./_components/client";
import { Metadata } from "next";
import { UserModel } from "@/db/schema";

export const metadata: Metadata = {
  title: "Users | Admin Panel",
};

export default async function Users() {
  const auth = getAuth();
  if (!(await auth.verify(["admin", "super admin"]))) return redirect("/");

  return (
    <main className="p-4">
      <div className="p-4 bg-background-dark rounded-md space-y-4">
        <h1 className="text-2xl font-bold text-primary">Users</h1>
        <Client
          roles={[
            "all",
            ...UserModel.role.enumValues.filter(
              (role) => role !== "super admin",
            ),
          ]}
        />
      </div>
    </main>
  );
}
