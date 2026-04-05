import getAuth from "@/lib/utils/auth";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Client from "./_components/client";
import { UserModel } from "@/db/schema";
import { z } from "zod";
import db from "@/db";
import Role from "@/types/role.type";

type Props = {
  params: Promise<unknown>;
};
type User = {
  id: number;
  role: Role;
  username: string;
};

async function init(props: Props): Promise<User> {
  const auth = getAuth();
  if (!(await auth.verify(["admin", "super admin"]))) return redirect("/");

  let params: z.infer<typeof paramsSchema>;
  try {
    params = paramsSchema.parse(await props.params);
  } catch {
    return notFound();
  }

  let user: User | undefined;
  try {
    user = await db.query.UserModel.findFirst({
      where: (user, { eq }) => eq(user.id, params.userId),
      columns: {
        id: true,
        role: true,
        username: true,
      },
    });
  } catch (e) {
    console.trace(e);
    return notFound();
  }

  if (!user) return notFound();

  return user;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const user = await init(props);
  return {
    title: `Change ${user.username}'s Role`,
  };
}

const paramsSchema = z.object({
  userId: z.coerce.number().min(1),
});

export default async function ChangeRole(props: Props) {
  const user = await init(props);

  return (
    <main className="p-4">
      <div className="bg-background-dark rounded-md md:max-w-250 mx-auto overflow-hidden">
        <h1 className="text-2xl font-bold bg-primary p-4 text-center">
          Change {user.username}&apos;s Role
        </h1>
        <Client
          previousRole={user.role}
          roles={
            UserModel.role.enumValues.filter(
              (role) => role !== "super admin",
            ) as [string, ...string[]]
          }
          userId={user.id}
        />
      </div>
    </main>
  );
}
