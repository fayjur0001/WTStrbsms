"use server";

import db from "@/db";
import { UserModel } from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { and, ne } from "drizzle-orm";

export type User = {
  value: number;
  name: string;
};

export default async function getUsersAction(): Promise<
  ResponseWraper<{ users: User[] }>
> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const payload = await auth.getPayload();

    if (!["admin", "super admin"].includes(payload.role))
      return { success: true, users: [] };

    const users = await getUsers(payload.id);

    return {
      success: true,
      users,
    };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}
async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized");
}

async function getUsers(ownId: number): Promise<User[]> {
  return await db
    .select({
      value: UserModel.id,
      name: UserModel.username,
    })
    .from(UserModel)
    .where(and(ne(UserModel.id, ownId)));
}
