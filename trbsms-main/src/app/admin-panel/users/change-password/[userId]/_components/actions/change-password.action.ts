"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/change-password.schema";
import bcrypt from "bcryptjs";
import db from "@/db";
import { eq } from "drizzle-orm";
import { UserModel } from "@/db/schema";

export default async function changePasswoedAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();
    const parsedData = await parseData(data);

    await changePassword(parsedData);

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
    return await schema.parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function changePassword(data: Awaited<ReturnType<typeof parseData>>) {
  const password = bcrypt.hashSync(data.password, bcrypt.genSaltSync());

  await db.update(UserModel).set({ password }).where(eq(UserModel.id, data.id));
}
