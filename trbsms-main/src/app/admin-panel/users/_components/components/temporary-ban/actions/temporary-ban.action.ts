"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import idExistsValidator from "../../../validators/id-exists.validator";
import db from "@/db";
import { eq, sql } from "drizzle-orm";
import { UserModel } from "@/db/schema";
import pusher from "@/lib/utils/pusher";

export default async function temporaryBanAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();
    const id = await parseData(data);

    await temporaryBan(id);
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

async function temporaryBan(id: number) {
  await db
    .update(UserModel)
    .set({
      banned: false,
      bannedTill: sql`CURRENT_TIMESTAMP + '7 days'::interval`,
    })
    .where(eq(UserModel.id, id));
}
async function refresh() {
  await pusher({ page: "/admin-panel/users", to: "admin" });
}
