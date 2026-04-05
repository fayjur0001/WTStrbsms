"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import idExistsValidator from "../../../validators/id-exists.validator";
import db from "@/db";
import { UserDeviceModel, UserModel } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import pusher from "@/lib/utils/pusher";

export default async function toggleBanUserAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();
    const id = await parseData(data);
    await banUser(id);
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

async function parseData(data: unknown) {
  try {
    return await z.coerce
      .number()
      .min(1)
      .superRefine(async (id, ctx) => {
        const message = await idExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function banUser(id: number) {
  await db
    .update(UserModel)
    .set({
      banned: sql`case when ${UserModel.banned} = true or ${UserModel.bannedTill} > CURRENT_TIMESTAMP then false else true  end`,
      bannedTill: null,
    })
    .where(eq(UserModel.id, id));

  await db.delete(UserDeviceModel).where(eq(UserDeviceModel.userId, id));
}

async function refresh() {
  await pusher({ page: "/admin-panel/users", to: "admin" });
}
