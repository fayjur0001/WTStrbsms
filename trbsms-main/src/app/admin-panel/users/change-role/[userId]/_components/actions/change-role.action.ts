"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import getSchema from "../schemas/get-change-role.schema";
import { UserModel } from "@/db/schema";
import db from "@/db";
import { eq } from "drizzle-orm";
import Role from "@/types/role.type";
import pusher from "@/lib/utils/pusher";

export default async function changeRoleAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();
    const { role, userId } = await parseData(data);

    await changeRole(userId, role as Role);

    await refresh();

    return { success: true };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);

    return { success: false, message: "Internal server error." };
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}
function parseData(data: unknown) {
  try {
    return getSchema(
      UserModel.role.enumValues.filter((role) => role !== "super admin") as [
        string,
        ...string[],
      ],
    ).parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function changeRole(userId: number, role: Role) {
  await db
    .update(UserModel)
    .set({
      role,
    })
    .where(eq(UserModel.id, userId));
}

async function refresh() {
  await pusher({
    page: "/admin-panel/users",
    to: "admin",
  });
}
