import getAuth from "@/lib/utils/auth";
import { notFound, redirect } from "next/navigation";
import Client from "./_components/client";
import { z } from "zod";
import db from "@/db";

type Props = { params: Promise<unknown> };
type User = { id: number; username: string };

const paramsSchema = z.object({
  userId: z.coerce.number().min(1),
});

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
      where: (model, { eq }) => eq(model.id, params.userId),
      columns: { id: true, username: true },
    });
  } catch (e) {
    console.trace(e);
    return notFound();
  }

  if (!user) return notFound();

  return user;
}

export async function generateMetadata({ params }: Props) {
  const user = await init({ params });

  return {
    title: `Change ${user.username}'s Password | Admin Panel`,
  };
}

export default async function ChangePassword(props: Props) {
  const user = await init(props);

  return (
    <main className="p-4">
      <div className="bg-background-dark rounded-md overflow-hidden md:max-w-250 mx-auto">
        <h1 className="text-center font-bold text-2xl bg-primary p-4">
          Change {user.username}&apos;s Password
        </h1>
        <Client id={user.id} />
      </div>
    </main>
  );
}
