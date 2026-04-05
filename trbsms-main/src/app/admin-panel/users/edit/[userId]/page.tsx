import db from "@/db";
import getAuth from "@/lib/utils/auth";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import Client from "./_conponents/client";
import { sql } from "drizzle-orm";
import { UserModel } from "@/db/schema";

type Props = {
  params: Promise<unknown>;
};

type User = {
  id: number;
  username: string;
  email: string;
  jabber: string;
  telegram: string;
};

const paramsSchema = z.object({
  userId: z.coerce.number(),
});

async function init(props: Props) {
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
      where: (model, { eq }) => eq(model.id, params.userId),
      columns: {
        id: true,
        username: true,
        email: true,
      },
      extras: {
        jabber: sql<string>`case
            when ${UserModel.jabber} is null then ''
            else ${UserModel.jabber}
          end`.as("jabber"),
        telegram: sql<string>`case
            when ${UserModel.telegram} is null then ''
            else ${UserModel.telegram}
          end`.as("telegram"),
        pinCode: sql<string>`case
            when ${UserModel.pinCode} is null then ''
            else ${UserModel.pinCode}
          end`.as("pinCode"),
      },
    });
  } catch (e) {
    console.trace(e);
    return notFound();
  }

  if (!user) return notFound();

  return user;
}

export async function generateMetadata(props: Props) {
  const user = await init(props);

  return {
    title: `Edit ${user.username}'s details`,
  };
}

export default async function Edit(props: Props) {
  const user = await init(props);

  return (
    <main className="p-4">
      <div className="bg-background-dark md:max-w-250 mx-auto rounded-md overflow-hidden">
        <h1 className="text-2xl font-bold p-3 text-center bg-primary">
          Edit {user.username}&apos;s details
        </h1>
        <Client {...user} />
      </div>
    </main>
  );
}
